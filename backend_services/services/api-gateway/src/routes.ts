import { FastifyInstance } from "fastify";

const routeCatalog = [
  { module: "auth", basePath: "/v1/auth", upstream: "auth-service" },
  { module: "users", basePath: "/v1/users", upstream: "user-service" },
  { module: "quiz", basePath: "/v1/quiz", upstream: "quiz-service" },
  { module: "learning", basePath: "/v1/learning", upstream: "learning-service" },
  { module: "gamification", basePath: "/v1/gamification", upstream: "gamification-service" },
  { module: "social", basePath: "/v1/social", upstream: "social-service" },
  { module: "analytics", basePath: "/v1/analytics", upstream: "analytics-service" },
  { module: "content", basePath: "/v1/content", upstream: "content-service" },
  { module: "notifications", basePath: "/v1/notifications", upstream: "notification-service" },
  { module: "sync", basePath: "/v1/sync", upstream: "sync-service" },
  { module: "recommendations", basePath: "/v1/recommendations", upstream: "recommendation-service" }
];

export function registerRoutes(app: FastifyInstance) {
  app.get("/v1/routes", async () => ({
    routes: routeCatalog,
    note: "In production this gateway forwards traffic via service discovery and mesh routing."
  }));

  app.get("/v1/status", async () => ({
    status: "gateway-online",
    serviceCount: routeCatalog.length
  }));
}
