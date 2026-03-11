import axios from "axios";
import { API_BASE_URL } from "../../config/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
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
