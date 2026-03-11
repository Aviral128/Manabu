import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/authRoutes";
import monitoringRoutes from "./routes/monitoringRoutes";
import quizRoutes from "./routes/quizRoutes";
import { errorHandler } from "./middleware/errorHandler";

function corsOrigin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
  if (!origin || env.corsOrigins.includes(origin)) {
    callback(null, true);
    return;
  }
  callback(new Error(`Blocked by CORS: ${origin}`));
}

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: corsOrigin, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));
  app.use(rateLimit({ windowMs: 60_000, limit: 120 }));

  app.get("/health", (_request, response) => {
    response.json({ ok: true, service: "backend_api" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/quizzes", quizRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/monitoring", monitoringRoutes);

  app.use(errorHandler);
  return app;
}
