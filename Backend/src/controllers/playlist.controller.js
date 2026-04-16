import User from '../models/User.js';
import { MAX_PLAYLIST_ITEMS } from '../config/constants.js';
import { normalizeVideoId,getString } from '../utils/helpers.js';
import { hydrateSongsWithAudio } from '../services/audio.service.js';
import mongoose from "mongoose";

export async function addPlaylistSong(req, res) {
  const userId = req.user.id;
  const { id, title, thumbnail, audioUrl } = req.body;

  const videoId = normalizeVideoId(id);

  const cleanTitle = getString(title);
  const cleanThumbnail = getString(thumbnail);
  const cleanAudioUrl = getString(audioUrl);

  if (!userId || !mongoose.Types.ObjectId.isValid(userId) || !videoId || !title || !thumbnail) {
    return res.status(400).json({
      success: false,
      message: 'Missing or invalid required fields',
    });
  }

  try {
    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const playlist = Array.isArray(user.playlists) ? user.playlists : [];

    if (playlist.some((song) => song.videoId === videoId)) {
      return res.status(409).json({
        success: false,
        message: 'Song already in playlist',
      });
    }

    if (playlist.length >= MAX_PLAYLIST_ITEMS) {
      return res.status(400).json({
        success: false,
        message: 'Playlist is full',
      });
    }

    await User.updateOne(
      { _id: userId },
      {
        $push: {
          playlists: {
            videoId,
            title,
            thumbnail,
            audioUrl: audioUrl || null,
            addedAt: new Date(),
          },
        },
      }
    );

    res.status(200).json({ success: true, message: 'Song added to playlist'});
  } catch (err) {
    
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

export async function getPlaylistSongs(req, res) {
  const userId = req.user.id;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      message: 'Invalid userId',
    });
  }

  try {
    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (!user.playlists || user.playlists.length === 0) {
      return res.status(200).json({
        songs: [],
        message: 'Playlist is empty',
      });
    }

    const songs = await hydrateSongsWithAudio(user.playlists);

    res.status(200).json({ songs });
  } catch (err) {
    res.status(500).json({
      message:err.message,
    });
  }
}

export async function removePlaylistSong(req, res) {
  const userId = req.user.id;
  const videoId = normalizeVideoId(req.body.videoId);

  if (!userId || !mongoose.Types.ObjectId.isValid(userId) || !videoId) {
    return res.status(400).json({
      message:"Missing or invalid required fields"
    })
  }

  try {
    await User.updateOne(
      { _id: userId },
      { $pull: { playlists: { videoId } } }
    );

    res.status(200).json({
      message:'Song removed from playlist'
    });
  } catch (err) {
    
    res.status(500).json({
      message:err.message
    });
  }
}