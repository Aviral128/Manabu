import { apiFetch } from "./http";

export async function fetchAnalyticsDashboard(userId: string) {
  return apiFetch(`/api/proxy/analytics/v1/analytics/dashboard/${encodeURIComponent(userId)}`);
}

export async function fetchRetention() {
  return apiFetch(`/api/proxy/analytics/v1/analytics/retention`);
}

export async function postAnalyticsEvent(payload: Record<string, unknown>) {
  return apiFetch(`/api/proxy/analytics/v1/analytics/events`, { method: "POST", body: payload, retries: 0 });
}

