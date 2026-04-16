import Audio from '../models/Audio.js';
import User from '../models/User.js';
import {
  MAX_AUDIO_CACHE_DOCS,
  USER_SEARCH_LIMIT,
} from '../config/constants.js';
import {
  inflightFetches,
  memoryAudioCache,
} from '../utils/cache.js';
import {
  audioRefreshQueue,
  warmupQueue,
} from '../utils/queue.js';
import {
  isFreshAudioDoc,
  isFreshMemoryEntry,
  isValidVideoId,
  normalizeAudioDoc,
  normalizeVideoId,
  isFreshSongEntry
} from '../utils/helpers.js';
import { runYtDlp } from './youtube.service.js';

export async function enforceAudioCacheLimit() {
  const count = await Audio.countDocuments();
  if (count <= MAX_AUDIO_CACHE_DOCS) return;

  const overflow = count - MAX_AUDIO_CACHE_DOCS;
  const oldestDocs = await Audio.find({})
    .sort({ updatedAt: 1 })
    .limit(overflow)
    .select('_id videoId')
    .lean();

  if (!oldestDocs.length) return;

  await Audio.deleteMany({ _id: { $in: oldestDocs.map((d) => d._id) } });

  for (const doc of oldestDocs) {
    memoryAudioCache.delete(doc.videoId);
  }
}

export async function persistAudioCache(videoId, audioUrl) {
  const entry = {
    videoId,
    audioUrl,
    updatedAt: new Date(),
  };

  memoryAudioCache.set(videoId, entry);

  await Audio.updateOne(
    { videoId },
    {
      $set: {
        videoId,
        audioUrl,
        updatedAt: entry.updatedAt,
      },
    },
    { upsert: true }
  );

  await enforceAudioCacheLimit();
  return entry;
}

export async function fetchFreshAudio(videoId) {
  if (inflightFetches.has(videoId)) {
    return inflightFetches.get(videoId);
  }

  const promise = (async () => {
    const audioUrl = await runYtDlp(videoId);
    return persistAudioCache(videoId, audioUrl);
  })();

  const wrapped = promise.finally(() => {
    inflightFetches.delete(videoId);
  });

  inflightFetches.set(videoId, wrapped);
  return wrapped;
}

export async function getCachedAudio(videoId, id) {
  const normalizedId = normalizeVideoId(videoId);

  // Memory cache
  const memoryEntry = memoryAudioCache.get(normalizedId);

  if (isFreshMemoryEntry(memoryEntry)) {
    return { ...memoryEntry, source: 'memory' };
  }

  if (memoryEntry) {
    memoryAudioCache.delete(normalizedId);
  }

  // 2. DB cache
  const dbDoc = await Audio.findOne({ videoId: normalizedId }).lean();

  if (isFreshAudioDoc(dbDoc)) {
    const entry = normalizeAudioDoc(dbDoc);
    memoryAudioCache.set(normalizedId, entry);
    return { ...entry, source: 'db' };
  }

  // 3. User playlist/recent (fallback)
  if (id) {
    const user = await User.findById(id).lean();

    if (user) {
      const playlistSong = user.playlists?.find(
        (song) => song.videoId === normalizedId
      );

      const recentSong = user.recentlyPlayed?.find(
        (song) => song.videoId === normalizedId
      );

      const song = playlistSong || recentSong;

      if (isFreshSongEntry(song)) {
        const entry = normalizeAudioDoc(song);

        return {
          ...entry,
          source: playlistSong ? "playlist" : "recent",
        };
      }
    }
  }

  // 4. Not found
  return null;
}

export async function updateUserSongAudioUrls(videoId, audioUrl) {
  const playlistUpdate = User.updateMany(
    { 'playlists.videoId': videoId },
    { $set: { 'playlists.$[song].audioUrl': audioUrl } },
    { arrayFilters: [{ 'song.videoId': videoId }] }
  );

  const recentUpdate = User.updateMany(
    { 'recentlyPlayed.videoId': videoId },
    { $set: { 'recentlyPlayed.$[song].audioUrl': audioUrl } },
    { arrayFilters: [{ 'song.videoId': videoId }] }
  );

  await Promise.all([playlistUpdate, recentUpdate]);
}

export async function hydrateSongsWithAudio(songs) {
  if (!Array.isArray(songs) || songs.length === 0) return [];

  const videoIds = [...new Set(
    songs.map((s) => s?.videoId).filter(isValidVideoId)
  )];

  if (!videoIds.length) return songs;

  const cacheDocs = await Audio.find({ videoId: { $in: videoIds } }).lean();
  const freshMap = new Map();

  for (const doc of cacheDocs) {
    if (isFreshAudioDoc(doc)) {
      freshMap.set(doc.videoId, doc.audioUrl);
    }
  }

  return songs.map((song) => ({
    ...song,
    audioUrl: freshMap.get(song.videoId) || song.audioUrl || null,
  }));
}

export async function getUniqueVideoIdsFromUsers() {
  const users = await User.find(
    {},
    { playlists: 1, recentlyPlayed: 1 }
  )
    .limit(USER_SEARCH_LIMIT)
    .lean();

  const ids = new Set();

  for (const user of users) {
    for (const song of user.playlists || []) {
      if (isValidVideoId(song?.videoId)) ids.add(song.videoId);
    }

    for (const song of user.recentlyPlayed || []) {
      if (isValidVideoId(song?.videoId)) ids.add(song.videoId);
    }
  }

  return [...ids];
}

export async function refreshIfStale(videoId) {
  const normalizedVideoId = normalizeVideoId(videoId);
  const cached = await Audio.findOne({ videoId: normalizedVideoId }).lean();

  if (cached && isFreshAudioDoc(cached)) {
    return cached.audioUrl;
  }

  const fresh = await fetchFreshAudio(normalizedVideoId);
  await updateUserSongAudioUrls(normalizedVideoId, fresh.audioUrl);
  return fresh.audioUrl;
}

export async function warmUpVideoIds(videoIds) {
  await warmupQueue.addAll(
    videoIds.map((videoId) => async () => {
      try {
        await refreshIfStale(videoId);
        console.log(`✅ Warmed: ${videoId}`);
      } catch (err) {
        console.error(`❌ Warmup failed for ${videoId}:`, err.message);
      }
    })
  );
}

export {
  audioRefreshQueue,
  warmupQueue,
  memoryAudioCache,
  inflightFetches,
};