import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import playerReducer from "../features/player/playerSlice";
import playlistReducer from "../features/playlist/playlistSlice";
import recentReducer from "../features/recent/recentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    player: playerReducer,
    playlist: playlistReducer,
    recent: recentReducer,
  },

});