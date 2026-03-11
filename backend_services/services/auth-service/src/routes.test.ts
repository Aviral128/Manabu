import test from "node:test";
import assert from "node:assert/strict";
import { createServiceServer } from "./server";
import { registerRoutes } from "./routes";

test("auth-service login validates payload", async () => {
  const app = createServiceServer({ serviceName: "auth-service", port: 7001, registerRoutes });

  const response = await app.inject({
    method: "POST",
    url: "/v1/auth/login",
    payload: { email: "invalid-email", password: "short" }
  });

  assert.equal(response.statusCode, 400);
  await app.close();
});

test("auth-service login returns tokens with valid payload", async () => {
  const app = createServiceServer({ serviceName: "auth-service", port: 7001, registerRoutes });

  const response = await app.inject({
    method: "POST",
    url: "/v1/auth/login",
    payload: { email: "learner@manabu.app", password: "StrongPass123" }
  });

  assert.equal(response.statusCode, 200);
  const json = response.json();
  assert.equal(typeof json.accessToken, "string");
  assert.equal(typeof json.refreshToken, "string");
  await app.close();
});
