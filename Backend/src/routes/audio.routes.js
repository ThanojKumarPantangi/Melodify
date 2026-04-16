import { Router } from 'express';
import { getAudioUrl } from '../controllers/audio.controller.js';

const router = Router();

router.get('/api/audio', getAudioUrl);

export default router;