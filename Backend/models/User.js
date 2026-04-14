const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  password: String,
  authKey: String,
  playlists: [
    {
      videoId: String,
      title: String,
      thumbnail: String,
      audioUrl: String
    }
  ],
  recentlyPlayed: [
    {
      videoId: String,
      title: String,
      thumbnail: String,
      audioUrl: String
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
