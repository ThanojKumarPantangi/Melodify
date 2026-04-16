import { Router } from 'express';
import {
  addRecentSong,
  getRecentSongs,
} from '../controllers/recent.controller.js';

const router = Router();

router.post('/api/recent', addRecentSong);
router.get('/api/recent', getRecentSongs);

export default router;