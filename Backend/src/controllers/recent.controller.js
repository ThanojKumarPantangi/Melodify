import User from '../models/User.js';
import { MAX_RECENTLY_PLAYED } from '../config/constants.js';
import { normalizeVideoId,getString } from '../utils/helpers.js';
import { hydrateSongsWithAudio } from '../services/audio.service.js';
import mongoose from "mongoose";

export async function addRecentSong(req, res) {
  const userId = req.user.id;

  const { id, title, thumbnail, audioUrl } = req.body;

  const videoId = normalizeVideoId(id);

  const titleClean = getString(title);
  const thumbnailClean = getString(thumbnail);
  const audioUrlClean = getString(audioUrl);

  if (
    !userId ||
    !mongoose.Types.ObjectId.isValid(userId) ||
    !videoId ||
    !title ||
    !thumbnail ||
    !audioUrl
  ) {
    return res.status(400).json({
      message:"Missing or invalid required fields"
    });
  }

  try {
    // Remove if already exists (avoid duplicates)
    await User.updateOne(
      { _id: userId },
      { $pull: { recentlyPlayed: { videoId } } }
    );

    // Add to top + limit size
    await User.updateOne(
      { _id: userId },
      {
        $push: {
          recentlyPlayed: {
            $each: [{ videoId, title, thumbnail, audioUrl }],
            $position: 0,
            $slice: MAX_RECENTLY_PLAYED,
          },
        },
      }
    );

    res.status(200).json({
      message:'Song added to recently played'
    });
  } catch (err) {
    res.status(500).json({
      message:err.message
    });
  }
}

export async function getRecentSongs(req, res) {
  const userId = req.user.id;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      message: 'Invalid userId parameter',
    });
  }

  try {
    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (!user.recentlyPlayed || user.recentlyPlayed.length === 0) {
      return res.status(200).json({
        songs: [],
        message: 'No recently played songs found',
      });
    }

    const songs = await hydrateSongsWithAudio(user.recentlyPlayed);

    res.status(200).json({ songs });
  } catch (err) {
    res.status(500).json({
      message:err.message
    });
  }
}