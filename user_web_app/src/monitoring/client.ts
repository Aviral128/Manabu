"use client";

type MonitoringLevel = "error" | "warning" | "info";

type MonitoringPayload = {
  level: MonitoringLevel;
  message: string;
  metadata?: Record<string, unknown>;
};

function safeString(value: unknown) {
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function reportClientEvent(payload: MonitoringPayload) {
  const body = JSON.stringify({
    source: "user_web",
    level: payload.level,
    message: payload.message,
    metadata: payload.metadata,
  });

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/proxy/backend/api/monitoring/events", blob);
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

export function reportClientError(error: unknown, metadata?: Record<string, unknown>) {
  reportClientEvent({
    level: "error",
    message: safeString(error),
    metadata,
  });
}
