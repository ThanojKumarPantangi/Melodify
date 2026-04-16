import apiClient from "./apiClient";

export function audioApi(videoId) {
  return apiClient.get(`/audio?videoId=${videoId}`);
}