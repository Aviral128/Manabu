import type { NextFunction, Request, Response } from "express";

function forbidden(response: Response, message: string) {
  return response.status(403).json({ code: "FORBIDDEN", message });
}

export function requireAdmin(request: Request, response: Response, next: NextFunction) {
  if (request.user?.role !== "admin") {
    return forbidden(response, "Admin access is required.");
  }

  return next();
}

export function requireManagerOrAdmin(request: Request, response: Response, next: NextFunction) {
  if (request.user?.role !== "admin" && request.user?.role !== "manager") {
    return forbidden(response, "Manager or admin access is required.");
  }

  return next();
}
