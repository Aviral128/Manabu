import { FastifyInstance } from "fastify";
import { AppError } from "@manabu/shared";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(80)
});

export function registerRoutes(app: FastifyInstance) {
  app.post("/v1/auth/register", async (request, reply) => {
    const body = registerSchema.safeParse(request.body);
    if (!body.success) {
      throw new AppError("Invalid registration payload", 400, "BAD_REQUEST");
    }

    request.log.info({ email: body.data.email }, "User registration requested");

    return reply.status(201).send({
      userId: "usr_mock_001",
      email: body.data.email,
      message: "Registration accepted"
    });
  });

  app.post("/v1/auth/login", async (request) => {
    const body = loginSchema.safeParse(request.body);
    if (!body.success) {
      throw new AppError("Invalid login payload", 400, "BAD_REQUEST");
    }

    request.log.info({ email: body.data.email }, "Login requested");

    return {
      accessToken: "jwt.access.mock",
      refreshToken: "jwt.refresh.mock",
      expiresInSeconds: 3600
    };
  });

  app.post("/v1/auth/password/recover", async () => ({
    message: "Recovery link queued"
  }));

  app.post("/v1/auth/oauth/:provider", async (request) => ({
    provider: (request.params as { provider: string }).provider,
    redirectUrl: "https://manabu.app/oauth/callback"
  }));
}
