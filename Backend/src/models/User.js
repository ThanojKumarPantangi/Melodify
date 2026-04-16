import mongoose from 'mongoose';

const songSchema = new mongoose.Schema(
  {
    videoId: String,
    title: String,
    thumbnail: String,
    audioUrl: String,
    addedAt: Date,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  authKey: {
    type: String,
    required: true,
  },
  playlists: [songSchema],
  recentlyPlayed: [songSchema],
});

const User = mongoose.model('User', userSchema);

export default User;