import { apiFetch } from "./http";

export async function aiWeakTopics(payload: unknown) {
  return apiFetch(`/api/proxy/ai/v1/ai/weak-topics`, { method: "POST", body: payload, retries: 0, timeoutMs: 20_000 });
}

export async function aiQuestionGeneration(payload: unknown) {
  return apiFetch(`/api/proxy/ai/v1/ai/question-generation`, {
    method: "POST",
    body: payload,
    retries: 0,
    timeoutMs: 30_000,
  });
}

export async function aiTutorExplanation(payload: unknown) {
  return apiFetch(`/api/proxy/ai/v1/ai/tutor-explanation`, {
    method: "POST",
    body: payload,
    retries: 0,
    timeoutMs: 30_000,
  });
}

export async function aiPersonalizedPlan(payload: unknown) {
  return apiFetch(`/api/proxy/ai/v1/ai/personalized-plan`, {
    method: "POST",
    body: payload,
    retries: 0,
    timeoutMs: 30_000,
  });
}

export async function aiKnowledgeGraph(payload: unknown) {
  return apiFetch(`/api/proxy/ai/v1/ai/knowledge-graph`, {
    method: "POST",
    body: payload,
    retries: 0,
    timeoutMs: 30_000,
  });
}

