import type { Request, Response } from "express";
import { z } from "zod";

import { createMonitoringEvent } from "../services/adminService";

const monitoringSchema = z.object({
  source: z.enum(["user_web", "admin_panel", "mobile_app", "backend"]),
  level: z.enum(["error", "warning", "info"]),
  message: z.string().min(1).max(500),
  metadata: z.unknown().optional(),
});

export async function ingestEvent(request: Request, response: Response) {
  const input = monitoringSchema.parse(request.body);
  await createMonitoringEvent({
    actorId: request.user?.userId,
    source: input.source,
    level: input.level,
    message: input.message,
    metadata: input.metadata,
  });
  return response.status(201).json({ success: true });
}
