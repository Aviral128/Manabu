import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:7000",
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers["x-platform"] = "mobile";
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized response error handling with retry hooks can be added here.
    return Promise.reject(error);
  }
);
