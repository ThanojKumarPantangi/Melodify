import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentSong: null,   // { id, title, thumbnail, audioUrl }
  isPlaying: false,
  queue: [],           // for future use
  currentIndex: 0,     // index in queue
  volume: 1,           // 0 to 1
  currentTime: 0,
  duration: 0,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    // Set and play a new song
    setCurrentSong: (state, action) => {
      state.currentSong = action.payload;
      state.isPlaying = true;
    },

    // Play
    play: (state) => {
      if (state.currentSong) {
        state.isPlaying = true;
      }
    },

    // Pause
    pause: (state) => {
      state.isPlaying = false;
    },

    // Toggle play/pause
    togglePlay: (state) => {
      if (state.currentSong) {
        state.isPlaying = !state.isPlaying;
      }
    },

    // Set queue (future use)
    setQueue: (state, action) => {
      state.queue = action.payload;
      state.currentIndex = 0;
    },

    // Next song (basic version)
    nextSong: (state) => {
      if (state.queue.length > 0) {
        state.currentIndex =
          (state.currentIndex + 1) % state.queue.length;
        state.currentSong = state.queue[state.currentIndex];
        state.isPlaying = true;
      }
    },

    // Previous song
    prevSong: (state) => {
      if (state.queue.length > 0) {
        state.currentIndex =
          (state.currentIndex - 1 + state.queue.length) %
          state.queue.length;
        state.currentSong = state.queue[state.currentIndex];
        state.isPlaying = true;
      }
    },

    // Volume control
    setVolume: (state, action) => {
      state.volume = action.payload;
    },

    setCurrentTime: (state, action) => {
      state.currentTime = action.payload;
    },

    setDuration: (state, action) => {
      state.duration = action.payload;
    },

    // Reset player
    resetPlayer: (state) => {
      state.currentSong = null;
      state.isPlaying = false;
      state.queue = [];
      state.currentIndex = 0;
    },
  },
});

export const {
  setCurrentSong,
  play,
  pause,
  togglePlay,
  setQueue,
  nextSong,
  prevSong,
  setVolume,
  setCurrentTime,
  setDuration,
  resetPlayer,
} = playerSlice.actions;

export default playerSlice.reducer;