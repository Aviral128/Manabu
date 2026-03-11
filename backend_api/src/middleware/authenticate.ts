import type { NextFunction, Request, Response } from "express";

import { verifyToken } from "../utils/jwt";

function readBearerToken(request: Request): string | null {
  const authHeader = request.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookieHeader = request.headers.cookie ?? "";
  const match = cookieHeader.match(/manabu_access_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function authenticate(request: Request, response: Response, next: NextFunction) {
  try {
    const token = readBearerToken(request);
    if (!token) {
      return response.status(401).json({ code: "UNAUTHENTICATED", message: "Authentication is required." });
    }

    request.user = verifyToken(token);
    return next();
  } catch {
    return response.status(401).json({ code: "INVALID_TOKEN", message: "Your session is no longer valid." });
  }
}
