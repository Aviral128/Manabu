import { FastifyInstance } from "fastify";

export function registerRoutes(app: FastifyInstance) {
  app.post("/v1/content/questions", async () => ({
    questionId: "q_90001",
    status: "draft"
  }));

  app.get("/v1/content/courses/:courseId", async (request) => ({
    courseId: (request.params as { courseId: string }).courseId,
    title: "Foundations of Algebra",
    units: 12,
    published: true
  }));

  app.post("/v1/content/moderation/queue", async () => ({
    queuedItems: 123,
    flaggedItems: 8
  }));
}
