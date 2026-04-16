import mongoose from 'mongoose';

const audioSchema = new mongoose.Schema({
  videoId: { type: String, unique: true, required: true },
  audioUrl: String,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Audio = mongoose.model('Audio', audioSchema);

export default Audio;