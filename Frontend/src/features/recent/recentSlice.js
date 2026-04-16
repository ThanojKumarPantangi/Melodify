import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  songs: [],       // recently played songs
  isLoading: false,
  error: null,
};

const recentSlice = createSlice({
  name: "recent",
  initialState,
  reducers: {
    // Fetch start
    fetchRecentStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    // Fetch success
    fetchRecentSuccess: (state, action) => {
      state.isLoading = false;
      state.songs = action.payload;
    },

    // Fetch failure
    fetchRecentFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Add to recent (when song is played)
    addToRecent: (state, action) => {
      const song = action.payload;

      // remove if already exists
      state.songs = state.songs.filter(
        (item) => item.id !== song.id
      );

      // add to front
      state.songs.unshift(song);

      // limit size (e.g., last 20 songs)
      if (state.songs.length > 20) {
        state.songs.pop();
      }
    },

    // Remove from recent
    removeFromRecent: (state, action) => {
      const id = action.payload;

      state.songs = state.songs.filter(
        (song) => song.id !== id
      );
    },

    // Clear recent
    clearRecent: (state) => {
      state.songs = [];
    },
  },
});

export const {
  fetchRecentStart,
  fetchRecentSuccess,
  fetchRecentFailure,
  addToRecent,
  removeFromRecent,
  clearRecent,
} = recentSlice.actions;

export default recentSlice.reducer;