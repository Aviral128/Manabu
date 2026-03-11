import { FastifyInstance } from "fastify";
import { AppError } from "@manabu/shared";
import { z } from "zod";

const preferenceSchema = z.object({
  locale: z.string().default("en-US"),
  dailyGoalMinutes: z.number().int().min(5).max(240),
  preferredSubjects: z.array(z.string()).max(20)
});

export function registerRoutes(app: FastifyInstance) {
  app.get("/v1/users/:id", async (request) => ({
    userId: (request.params as { id: string }).id,
    displayName: "Learner Demo",
    avatarUrl: "https://cdn.manabu.app/avatar/default.png"
  }));

  app.put("/v1/users/:id/preferences", async (request) => {
    const payload = preferenceSchema.safeParse(request.body);
    if (!payload.success) {
      throw new AppError("Invalid preferences payload", 400, "BAD_REQUEST");
    }

    return {
      userId: (request.params as { id: string }).id,
      preferences: payload.data,
      updated: true
    };
  });

  app.get("/v1/users/:id/history", async (request) => ({
    userId: (request.params as { id: string }).id,
    recentActivity: [
      { type: "quiz_completed", topic: "algebra", score: 0.85 },
      { type: "flashcard_review", topic: "biology", cardsStudied: 40 }
    ]
  }));
}
