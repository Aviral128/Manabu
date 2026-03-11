import axios from "axios";

import { env } from "../../config/env";
import { getToken } from "../../security/tokenStore";
import { reportMobileError } from "../monitoring";

const FALLBACK_HEADER = "x-manabu-base-url";
let candidateIndex = 0;

function getCurrentBaseUrl() {
  return env.apiCandidates[candidateIndex] ?? env.apiUrl;
}

function nextBaseUrl() {
  if (candidateIndex >= env.apiCandidates.length - 1) return null;
  candidateIndex += 1;
  return getCurrentBaseUrl();
}

export const apiClient = axios.create({
  baseURL: getCurrentBaseUrl(),
  timeout: 12000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  config.headers = config.headers ?? {};
  config.baseURL = getCurrentBaseUrl();
  config.headers["x-platform"] = "mobile";
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const fallbackBaseUrl = nextBaseUrl();
    const originalRequest = error?.config;
    const isNetworkFailure = !error?.response;
    const alreadyRetried = Boolean(originalRequest?.headers?.[FALLBACK_HEADER]);

    if (isNetworkFailure && fallbackBaseUrl && originalRequest && !alreadyRetried) {
      originalRequest.baseURL = fallbackBaseUrl;
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers[FALLBACK_HEADER] = fallbackBaseUrl;
      return apiClient.request(originalRequest);
    }

    if (isNetworkFailure) {
      error.message =
        "Cannot reach the MANABU server. If you are using a real phone, keep it on the same Wi-Fi as this PC. If you are using an Android emulator, MANABU will try 10.0.2.2 automatically.";
    }

    await reportMobileError(error, {
      type: "api.response",
      url: error?.config?.url,
      method: error?.config?.method,
      status: error?.response?.status,
    });
    return Promise.reject(error);
  }
);
