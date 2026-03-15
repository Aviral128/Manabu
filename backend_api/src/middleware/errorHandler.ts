import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { env } from "../config/env";
import { AppError } from "../utils/appError";

function isZodLikeError(error: unknown): error is ZodError {
  return error instanceof ZodError || Boolean(error && typeof error === "object" && Array.isArray((error as any).issues));
}

function isAppLikeError(error: unknown): error is AppError {
  return (
    error instanceof AppError ||
    Boolean(
      error &&
        typeof error === "object" &&
        typeof (error as any).statusCode === "number" &&
        typeof (error as any).code === "string" &&
        typeof (error as any).message === "string",
    )
  );
}

export function errorHandler(error: Error, _request: Request, response: Response, _next: NextFunction) {
  if (isZodLikeError(error)) {
    return response.status(400).json({
      code: "VALIDATION_ERROR",
      message: error.issues[0]?.message ?? "The request body is invalid.",
      details: error.flatten(),
    });
  }

  if (isAppLikeError(error)) {
    return response.status(error.statusCode).json({ code: error.code, message: error.message });
  }

  console.error("backend_api_error", error);

  return response.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: env.NODE_ENV === "development" ? error.message || "Unexpected server error." : "Unexpected server error.",
  });
}
