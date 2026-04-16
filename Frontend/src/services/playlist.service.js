import apiClient from "./apiClient";

export function addPlaylistApi(song) {
  return apiClient.post("/playlist", song);
}

export function getPlaylistApi() {
  return apiClient.get("/playlist");
}

export function removePlaylistApi(videoId) {
  return apiClient.delete("/playlist", { data: { videoId } });
}