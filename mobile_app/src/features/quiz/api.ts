import { apiClient } from "../../core/api/client";

export async function fetchAdaptiveQuiz(topic: string, difficulty: "easy" | "medium" | "hard") {
  const response = await apiClient.post("/v1/quiz/sessions", {
    topic,
    difficulty,
    questionCount: 15,
    timed: true,
    userId: "current-user",
  });
  return response.data;
}
