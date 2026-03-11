import { FastifyInstance } from "fastify";

export function registerRoutes(app: FastifyInstance) {
  app.get("/v1/recommendations/next/:userId", async (request) => ({
    userId: (request.params as { userId: string }).userId,
    recommendations: [
      { type: "lesson", id: "lesson_linear_equations", reason: "Weak-topic remediation" },
      { type: "quiz", id: "quiz_algebra_medium", reason: "Mastery reinforcement" }
    ]
  }));

  app.post("/v1/recommendations/feedback", async () => ({
    accepted: true,
    modelUpdateQueued: true
  }));
}
