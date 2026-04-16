import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  songs: [],       // playlist songs
  isLoading: false,
  error: null,
};

const playlistSlice = createSlice({
  name: "playlist",
  initialState,
  reducers: {
    // Fetch start
    fetchPlaylistStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    // Fetch success
    fetchPlaylistSuccess: (state, action) => {
      state.isLoading = false;
      state.songs = action.payload;
    },

    // Fetch failure
    fetchPlaylistFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Add song to playlist
    addToPlaylist: (state, action) => {
      const song = action.payload;

      // prevent duplicates (based on videoId or id)
      const exists = state.songs.find(
        (item) => item.id === song.id
      );

      if (!exists) {
        state.songs.unshift(song);
      }
    },

    // Remove song
    removeFromPlaylist: (state, action) => {
      const id = action.payload;

      state.songs = state.songs.filter(
        (song) => song.id !== id
      );
    },

    // Clear playlist
    clearPlaylist: (state) => {
      state.songs = [];
    },
  },
});

export const {
  fetchPlaylistStart,
  fetchPlaylistSuccess,
  fetchPlaylistFailure,
  addToPlaylist,
  removeFromPlaylist,
  clearPlaylist,
} = playlistSlice.actions;

export default playlistSlice.reducer;