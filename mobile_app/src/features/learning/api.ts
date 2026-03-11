import { apiClient } from "../../core/api/client";

export async function fetchLearningPlan(userId: string) {
  const response = await apiClient.get(`/v1/learning/plan/${userId}`);
  return response.data;
}
