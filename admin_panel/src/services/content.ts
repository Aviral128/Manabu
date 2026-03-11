import { apiFetch } from "./http";

export async function fetchModerationQueue() {
  return apiFetch(`/api/proxy/content/v1/content/moderation/queue`, { method: "POST", retries: 0 });
}

export async function createQuestionDraft(payload: Record<string, unknown>) {
  return apiFetch(`/api/proxy/content/v1/content/questions`, { method: "POST", body: payload, retries: 0 });
}

export async function fetchCourse(courseId: string) {
  return apiFetch(`/api/proxy/content/v1/content/courses/${encodeURIComponent(courseId)}`);
}

