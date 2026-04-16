import { Router } from 'express';
import {
  getUserByUsername,
  login,
  signup,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/api/signup', signup);
router.post('/api/login', login);
// router.get('/user/:username', getUserByUsername);

export default router;