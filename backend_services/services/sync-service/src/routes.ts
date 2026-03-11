import { FastifyInstance } from "fastify";

export function registerRoutes(app: FastifyInstance) {
  app.post("/v1/sync/offline-batch", async () => ({
    accepted: true,
    syncJobId: "sync_job_551"
  }));

  app.get("/v1/sync/conflicts/:userId", async (request) => ({
    userId: (request.params as { userId: string }).userId,
    conflicts: [
      { entity: "quiz_attempt", id: "qa_11", strategy: "last_write_wins" }
    ]
  }));

  app.post("/v1/sync/checkpoint/:userId", async (request) => ({
    userId: (request.params as { userId: string }).userId,
    checkpointToken: "cp_2026_03_08_01"
  }));
}
