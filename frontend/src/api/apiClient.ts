import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:1337/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Injecte le token JWT automatiquement si présent
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});