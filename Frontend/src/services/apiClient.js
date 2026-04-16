import axios from "axios";

// Base URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {

    const user = JSON.parse(localStorage.getItem("auth"));

    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response) {
      // Server responded with error
      const message =
        error.response.data?.message || "Something went wrong";

      return Promise.reject(new Error(message));
    }

    if (error.request) {
      // No response from server
      return Promise.reject(new Error("No response from server"));
    }

    return Promise.reject(new Error(error.message));
  }
);

export default apiClient;