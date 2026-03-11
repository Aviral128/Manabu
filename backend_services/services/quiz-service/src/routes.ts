import { FastifyInstance } from "fastify";
import { AppError } from "@manabu/shared";
import { z } from "zod";

const createQuizSchema = z.object({
  userId: z.string(),
  topic: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  questionCount: z.number().int().min(5).max(100),
  timed: z.boolean().default(true)
});

export function registerRoutes(app: FastifyInstance) {
  app.post("/v1/quiz/sessions", async (request) => {
    const payload = createQuizSchema.safeParse(request.body);
    if (!payload.success) {
      throw new AppError("Invalid quiz creation payload", 400, "BAD_REQUEST");
    }

    return {
      quizSessionId: "quiz_session_mock_001",
      config: payload.data,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    };
  });

  app.post("/v1/quiz/sessions/:sessionId/submit", async (request) => ({
    sessionId: (request.params as { sessionId: string }).sessionId,
    score: 0.82,
    correctAnswers: 41,
    totalQuestions: 50,
    weakTopics: ["linear_equations", "fraction_operations"]
  }));

  app.get("/v1/quiz/questions", async () => ({
    items: [
      { id: "q_001", topic: "algebra", difficulty: "medium" },
      { id: "q_002", topic: "geometry", difficulty: "hard" }
    ]
  }));
}
