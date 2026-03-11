import test from "node:test";
import assert from "node:assert/strict";
import { createServiceServer } from "./server";
import { registerRoutes } from "./routes";

test("quiz-service creates quiz session", async () => {
  const app = createServiceServer({ serviceName: "quiz-service", port: 7003, registerRoutes });

  const response = await app.inject({
    method: "POST",
    url: "/v1/quiz/sessions",
    payload: {
      userId: "usr_101",
      topic: "algebra",
      difficulty: "medium",
      questionCount: 20,
      timed: true
    }
  });

  assert.equal(response.statusCode, 200);
  const data = response.json();
  assert.equal(data.config.topic, "algebra");
  await app.close();
});
