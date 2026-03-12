import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:1337/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem("jwt");
      localStorage.removeItem("user");

      if (!window.location.pathname.startsWith("/auth")) {
        window.location.assign("/auth/login");
      }
    }

    return Promise.reject(error);
  }
);