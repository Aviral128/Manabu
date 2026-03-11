import { apiFetch } from "./http";

export async function fetchLearningPlan(userId: string) {
  return apiFetch("learning", `/v1/learning/plan/${encodeURIComponent(userId)}`);
}

export async function fetchKnowledgeGraph(userId: string) {
  return apiFetch("learning", `/v1/learning/knowledge-graph/${encodeURIComponent(userId)}`);
}

