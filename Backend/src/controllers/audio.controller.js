import { fetchFreshAudio, getCachedAudio, updateUserSongAudioUrls } from '../services/audio.service.js';
import { isValidVideoId, normalizeVideoId } from '../utils/helpers.js';

export async function getAudioUrl(req, res) {
  const videoId = normalizeVideoId(req.query.videoId);
  const id = req.user.id;

  if (!videoId || !isValidVideoId(videoId)) {
    return res.status(400).json({ message: 'Missing or invalid videoId parameter' });
  }

  try {
    const cached = await getCachedAudio(videoId,id);
    if (cached?.audioUrl) {
      return res.json({
        audioUrl: cached.audioUrl,
        source: cached.source,
      });
    }

    const fresh = await fetchFreshAudio(videoId);

    if (fresh?.audioUrl) {
      void updateUserSongAudioUrls(videoId, fresh.audioUrl).catch((err) => {
        console.warn(`⚠️ Failed to update user audioUrl refs for ${videoId}:`, err.message);
      });
    }

    res.json({
      audioUrl: fresh.audioUrl,
      source: 'fresh',
    });
  } catch (err) {
    if (err.message === 'VIDEO_RESTRICTED') {
      return res.status(403).json({ error: 'Video is restricted' });
    }

    if (err.message === 'VIDEO_PRIVATE') {
      return res.status(403).json({ error: 'Private video' });
    }

    if (err.message === 'VIDEO_UNAVAILABLE') {
      return res.status(404).json({ error: 'Video unavailable' });
    }

    res.status(500).json({
      message: 'Failed to get audio URL',
      details: err.message,
    });
  }
}