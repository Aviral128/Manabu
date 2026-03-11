import { apiFetch } from "./http";

export async function fetchAnalyticsDashboard(userId: string) {
  return apiFetch("analytics", `/v1/analytics/dashboard/${encodeURIComponent(userId)}`);
}

export async function fetchRetention() {
  return apiFetch("analytics", `/v1/analytics/retention`);
}

