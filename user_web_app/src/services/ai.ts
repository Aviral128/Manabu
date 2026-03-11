import { apiFetch } from "./http";

export async function aiWeakTopics(payload: unknown) {
  return apiFetch("ai", "/v1/ai/weak-topics", { method: "POST", body: payload, retries: 0, timeoutMs: 20_000 });
}

export async function aiQuestionGeneration(payload: unknown) {
  return apiFetch("ai", "/v1/ai/question-generation", { method: "POST", body: payload, retries: 0, timeoutMs: 30_000 });
}

export async function aiTutorExplanation(payload: unknown) {
  return apiFetch("ai", "/v1/ai/tutor-explanation", { method: "POST", body: payload, retries: 0, timeoutMs: 30_000 });
}

