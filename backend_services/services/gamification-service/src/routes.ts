import { FastifyInstance } from "fastify";

export function registerRoutes(app: FastifyInstance) {
  app.get("/v1/gamification/profile/:userId", async (request) => ({
    userId: (request.params as { userId: string }).userId,
    xp: 12340,
    level: 28,
    dailyStreak: 16,
    badges: ["consistency_master", "algebra_ninja"]
  }));

  app.post("/v1/gamification/events/xp", async () => ({
    applied: true,
    newXp: 12420,
    levelUp: false
  }));

  app.get("/v1/gamification/rewards/:userId", async (request) => ({
    userId: (request.params as { userId: string }).userId,
    rewards: [
      { type: "avatar_item", id: "item_dragon_hat", unlocked: true },
      { type: "theme", id: "theme_sakura", unlocked: false }
    ]
  }));
}

