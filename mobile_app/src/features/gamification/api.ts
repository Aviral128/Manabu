import { apiClient } from "../../core/api/client";

export async function fetchGamificationProfile(userId: string) {
  const response = await apiClient.get(`/v1/gamification/profile/${userId}`);
  return response.data;
}
