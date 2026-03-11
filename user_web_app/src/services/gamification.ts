import { apiFetch } from "./http";

export async function fetchGamificationProfile(userId: string) {
  return apiFetch("gamification", `/v1/gamification/profile/${encodeURIComponent(userId)}`);
}

export async function fetchRewards(userId: string) {
  return apiFetch("gamification", `/v1/gamification/rewards/${encodeURIComponent(userId)}`);
}

