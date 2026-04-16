import apiClient from "./apiClient";

export function searchApi(query, signal) {
  return apiClient.get(`/search?q=${encodeURIComponent(query)}`, {
    signal,
  });
}