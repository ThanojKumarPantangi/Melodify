import apiClient from "./apiClient";

export const getRecentSongs = () => {
  return apiClient.get(`/recent`);
};

export const addRecentSongApi = (song) => {
  return apiClient.post(`/recent`, song);
};
