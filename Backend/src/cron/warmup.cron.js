import cron from 'node-cron';
import {
  getUniqueVideoIdsFromUsers,
  warmUpVideoIds,
} from '../services/audio.service.js';

let isWarmupCronRunning = false;

export function startWarmupCron() {
  cron.schedule('*/30 * * * *', async () => {
    if (isWarmupCronRunning) {
      console.log('🔄 Warmup cron already running, skipping this cycle.');
      return;
    }

    isWarmupCronRunning = true;
    console.log('🔄 CRON: Starting warmup job from playlists and recent songs...');

    try {
      const videoIds = await getUniqueVideoIdsFromUsers();
      console.log(`📦 Found ${videoIds.length} unique songs to process`);

      await warmUpVideoIds(videoIds);
      console.log('✅ Warmup job completed');
    } catch (err) {
      console.error('❌ Warmup cron failed:', err.message);
    } finally {
      isWarmupCronRunning = false;
    }
  });
}