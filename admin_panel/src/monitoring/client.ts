"use client";

type MonitoringLevel = "error" | "warning" | "info";

function toMessage(error: unknown) {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function reportAdminEvent(level: MonitoringLevel, message: string, metadata?: Record<string, unknown>) {
  const body = JSON.stringify({
    source: "admin_panel",
    level,
    message,
    metadata,
  });

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    navigator.sendBeacon("/api/proxy/backend/api/monitoring/events", new Blob([body], { type: "application/json" }));
    return;
  }

  void fetch("/api/proxy/backend/api/monitoring/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
    cache: "no-store",
  }).catch(() => undefined);
}

export function reportAdminError(error: unknown, metadata?: Record<string, unknown>) {
  reportAdminEvent("error", toMessage(error), metadata);
}
