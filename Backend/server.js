import 'dotenv/config';

import connectDB from './src/config/db.js';
import { PORT } from './src/config/constants.js';
import app from './src/app.js';
import { startRefreshCron } from './src/cron/refresh.cron.js';
import { startWarmupCron } from './src/cron/warmup.cron.js';

const startServer = async () => {
  await connectDB();

  startRefreshCron();
  startWarmupCron();

  app.listen(PORT,() => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
  });
};

startServer();