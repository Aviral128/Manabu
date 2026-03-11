import { apiClient } from "../../core/api/client";

export async function fetchGlobalLeaderboard() {
  const response = await apiClient.get("/v1/social/leaderboard/global");
  return response.data;
}
