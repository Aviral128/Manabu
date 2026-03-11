import { FastifyInstance } from "fastify";

export function registerRoutes(app: FastifyInstance) {
  app.get("/v1/learning/plan/:userId", async (request) => ({
    userId: (request.params as { userId: string }).userId,
    plan: [
      { topic: "algebra", targetMastery: 0.9, activities: ["quiz", "flashcards", "ai_tutor"] },
      { topic: "biology_cells", targetMastery: 0.85, activities: ["micro_lesson", "revision_quiz"] }
    ]
  }));

  app.post("/v1/learning/weak-topics/analyze", async () => ({
    weakTopics: ["algebra_linear", "chemistry_balancing_equations"],
    confidence: 0.94
  }));

  app.get("/v1/learning/knowledge-graph/:userId", async () => ({
    nodes: [
      { id: "concept_algebra", mastery: 0.68 },
      { id: "concept_linear_equations", mastery: 0.43 }
    ],
    edges: [
      { from: "concept_algebra", to: "concept_linear_equations", weight: 0.9 }
    ]
  }));
}
