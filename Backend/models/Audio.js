const mongoose = require('mongoose');

const audioSchema = new mongoose.Schema({
  videoId: {type:String,unique:true},
  audioUrl: String,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Audio', audioSchema);
