import Fastify from "fastify";
import { AppError, createLogger, nowIso } from "@manabu/shared";

export type ServiceServerOptions = {
  serviceName: string;
  port: number;
  registerRoutes: (app: any) => void;
};

export function createServiceServer(options: ServiceServerOptions) {
  const logger = createLogger(options.serviceName);
  const app = Fastify({ loggerInstance: logger });

  app.get("/health", async () => ({
    service: options.serviceName,
    status: "ok",
    timestamp: nowIso()
  }));

  options.registerRoutes(app);

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      (request.log as any).warn({ err: error, code: error.code }, "Handled domain error");
      reply.status(error.statusCode).send({
        code: error.code,
        message: error.message
      });
      return;
    }

    (request.log as any).error({ err: error }, "Unhandled request error");
    reply.status(500).send({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred."
    });
  });

  return app;
}

