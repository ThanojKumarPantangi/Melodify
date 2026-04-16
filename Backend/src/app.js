import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import audioRoutes from './routes/audio.routes.js';
import playlistRoutes from './routes/playlist.routes.js';
import recentRoutes from './routes/recent.routes.js';
import searchRoutes from './routes/search.routes.js';

import { authMiddleware } from './middleware/auth.middleware.js';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
  res.status(200).json({
    message:'Server Running'
  });
});

app.use(authRoutes);
app.use(authMiddleware,searchRoutes);
app.use(authMiddleware,recentRoutes);
app.use(authMiddleware,playlistRoutes);
app.use(authMiddleware,audioRoutes);

export default app;