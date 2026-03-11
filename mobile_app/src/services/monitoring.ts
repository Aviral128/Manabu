import axios from "axios";

import { env } from "../config/env";

export async function reportMobileError(error: unknown, metadata?: Record<string, unknown>) {
  const message =
    typeof error === "string" ? error : error instanceof Error ? error.message : JSON.stringify(error ?? "Unknown error");

  try {
    await axios.post(
      `${env.apiUrl}/api/monitoring/events`,
      {
        source: "mobile_app",
        level: "error",
        message,
        metadata,
      },
      {
        timeout: 5000,
      }
    );
  } catch {
    // Ignore monitoring failures so the app remains usable.
  }
}
