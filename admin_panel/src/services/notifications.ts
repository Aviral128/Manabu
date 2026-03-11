import { apiFetch } from "./http";

export async function triggerDailyChallenge() {
  return apiFetch(`/api/proxy/notifications/v1/notifications/daily-challenge`, { method: "POST", retries: 0 });
}

export async function triggerReminders() {
  return apiFetch(`/api/proxy/notifications/v1/notifications/reminders`, { method: "POST", retries: 0 });
}

export async function triggerAchievementNotification() {
  return apiFetch(`/api/proxy/notifications/v1/notifications/achievements`, { method: "POST", retries: 0 });
}

