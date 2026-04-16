import { Router } from 'express';
import {
  addPlaylistSong,
  getPlaylistSongs,
  removePlaylistSong,
} from '../controllers/playlist.controller.js';

const router = Router();

router.post('/api/playlist', addPlaylistSong);
router.get('/api/playlist', getPlaylistSongs);  
router.delete('/api/playlist', removePlaylistSong);

export default router;