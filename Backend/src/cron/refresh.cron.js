import cron from 'node-cron';
import Audio from '../models/Audio.js';
import { AUDIO_TTL_MS } from '../config/constants.js';
import {
  audioRefreshQueue,
  fetchFreshAudio,
  updateUserSongAudioUrls,
} from '../services/audio.service.js';
import { isValidVideoId, normalizeVideoId } from '../utils/helpers.js';

let isRefreshCronRunning = false;

export function startRefreshCron() {
  cron.schedule('*/10 * * * *', async () => {
    if (isRefreshCronRunning) {
      console.log('🔄 Refresh cron already running, skipping this cycle.');
      return;
    }

    isRefreshCronRunning = true;
    console.log('🔄 CRON: Checking for stale audio URLs...');

    try {
      const cutoff = new Date(Date.now() - AUDIO_TTL_MS);

      const staleAudios = await Audio.find({
        $or: [
          { updatedAt: { $exists: false } },
          { updatedAt: { $lt: cutoff } },
        ],
        videoId: { $exists: true, $ne: null, $ne: '' },
      })
        .select('videoId updatedAt')
        .lean();

      if (!staleAudios.length) {
        console.log('✅ No stale audio URLs found.');
        return;
      }

      await audioRefreshQueue.addAll(
        staleAudios.map((audio) => async () => {
          const videoId = normalizeVideoId(audio.videoId);
          if (!isValidVideoId(videoId)) {
            console.log(`⚠️ Skipping invalid videoId: ${audio.videoId}`);
            return;
          }

          try {
            const fresh = await fetchFreshAudio(videoId);
            await updateUserSongAudioUrls(videoId, fresh.audioUrl);
            console.log(`✅ Refreshed: ${videoId}`);
          } catch (err) {
            console.error(`❌ Refresh failed for ${videoId}:`, err.message);
          }
        })
      );
    } catch (err) {
      console.error('❌ Audio refresh cron failed:', err.message);
    } finally {
      isRefreshCronRunning = false;
    }
  });
}