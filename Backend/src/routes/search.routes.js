import { Router } from 'express';
import axios from 'axios';

const router = Router();

router.get('/api/search', async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';

  if (!query) {
    return res.status(400).json({
      message:'Missing search query'
    });
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      query
    )}&type=video&maxResults=5&key=${process.env.YT_API_KEY}`;

    const response = await axios.get(url, { timeout: 15_000 });
    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({
      message:'Search failed'
    });
  }
});

export default router;