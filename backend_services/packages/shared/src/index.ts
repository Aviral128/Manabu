import pino from "pino";
import { z } from "zod";

export type ServiceContext = {
  serviceName: string;
  requestId?: string;
  userId?: string;
};

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info")
});

export function loadEnv() {
  return envSchema.parse(process.env);
}

export function createLogger(serviceName: string) {
  const env = loadEnv();
  return pino({
    name: serviceName,
    level: env.LOG_LEVEL,
    base: { service: serviceName }
  });
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function withErrorBoundary<T>(fn: () => Promise<T>, logger: pino.Logger, ctx: ServiceContext) {
  return fn().catch((error: unknown) => {
    logger.error({ err: error, ...ctx }, "Unhandled async error");
    throw error;
  });
}

export function nowIso() {
  return new Date().toISOString();
}
