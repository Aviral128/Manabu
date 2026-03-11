import { FastifyInstance } from "fastify";

export function registerRoutes(app: FastifyInstance) {
  app.post("/v1/notifications/daily-challenge", async () => ({
    scheduled: true,
    audience: "active_learners"
  }));

  app.post("/v1/notifications/reminders", async () => ({
    enqueued: 450,
    channel: "push"
  }));

  app.post("/v1/notifications/achievements", async () => ({
    delivered: true,
    provider: "firebase_fcm"
  }));
}
