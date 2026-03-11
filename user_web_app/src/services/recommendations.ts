import { apiFetch } from "./http";

export async function fetchRecommendations(userId: string) {
  return apiFetch("recommendations", `/v1/recommendations/next/${encodeURIComponent(userId)}`);
}

