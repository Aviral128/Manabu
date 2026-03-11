import { FastifyInstance } from "fastify";

export function registerRoutes(app: FastifyInstance) {
  app.get("/v1/analytics/dashboard/:userId", async (request) => ({
    userId: (request.params as { userId: string }).userId,
    accuracy: 0.81,
    weeklyStudyMinutes: 420,
    masteryByTopic: [
      { topic: "algebra", mastery: 0.75 },
      { topic: "biology", mastery: 0.62 }
    ]
  }));

  app.post("/v1/analytics/events", async () => ({
    accepted: true,
    buffered: true
  }));

  app.get("/v1/analytics/retention", async () => ({
    day1: 0.72,
    day7: 0.41,
    day30: 0.21
  }));
}
