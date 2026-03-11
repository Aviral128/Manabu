import { apiFetch } from "./http";

export async function fetchFriends(userId: string) {
  return apiFetch("social", `/v1/social/friends/${encodeURIComponent(userId)}`);
}

export async function fetchGlobalLeaderboard() {
  return apiFetch("social", `/v1/social/leaderboard/global`);
}

