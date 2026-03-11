import { apiFetch } from "./http";

export async function fetchFriends(userId: string) {
  return apiFetch(`/api/proxy/social/v1/social/friends/${encodeURIComponent(userId)}`);
}

export async function fetchGlobalLeaderboard() {
  return apiFetch(`/api/proxy/social/v1/social/leaderboard/global`);
}

export async function createBattle() {
  return apiFetch(`/api/proxy/social/v1/social/battles`, { method: "POST", retries: 0 });
}

