import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "../utils/appError";

export function errorHandler(error: Error, _request: Request, response: Response, _next: NextFunction) {
  console.error("backend_api_error", error);

  if (error instanceof ZodError) {
    return response.status(400).json({
      code: "VALIDATION_ERROR",
      message: error.issues[0]?.message ?? "The request body is invalid.",
      details: error.flatten(),
    });
  }

  if (error instanceof AppError) {
    return response.status(error.statusCode).json({ code: error.code, message: error.message });
  }

  return response.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: error.message || "Unexpected server error.",
  });
}
