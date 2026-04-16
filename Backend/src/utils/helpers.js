import { AUDIO_TTL_MS } from '../config/constants.js';

export function normalizeVideoId(videoId) {
  return typeof videoId === 'string' ? videoId.trim() : '';
}

export function getString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function isValidVideoId(videoId) {
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
}

export function buildYoutubeUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function isFreshUpdatedAt(updatedAt) {
  if (!updatedAt) return false;
  const ts = new Date(updatedAt).getTime();
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts <= AUDIO_TTL_MS;
}

export function normalizeAudioDoc(doc) {
  if (!doc) return null;

  return {
    videoId: doc.videoId,
    audioUrl: doc.audioUrl,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : null,
  };
}

export function isFreshSongEntry(song) {
  return !!(
    song &&
    song.audioUrl &&
    isFreshUpdatedAt(song.updatedAt)
  );
}

export function isFreshAudioDoc(doc) {
  return !!(doc && doc.audioUrl && isFreshUpdatedAt(doc.updatedAt));
}

export function isFreshMemoryEntry(entry) {
  return !!(entry && entry.audioUrl && isFreshUpdatedAt(entry.updatedAt));
}

export function generateAuthKey() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}