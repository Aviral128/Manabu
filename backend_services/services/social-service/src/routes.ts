import { FastifyInstance } from "fastify";

export function registerRoutes(app: FastifyInstance) {
  app.get("/v1/social/friends/:userId", async (request) => ({
    userId: (request.params as { userId: string }).userId,
    friends: [
      { userId: "usr_102", name: "Aki", status: "online" },
      { userId: "usr_203", name: "Rin", status: "offline" }
    ]
  }));

  app.post("/v1/social/battles", async () => ({
    battleId: "battle_9001",
    mode: "real_time_quiz",
    state: "waiting_for_players"
  }));

  app.get("/v1/social/leaderboard/global", async () => ({
    period: "weekly",
    entries: [
      { rank: 1, userId: "usr_001", xp: 4500 },
      { rank: 2, userId: "usr_057", xp: 4370 }
    ]
  }));
}
