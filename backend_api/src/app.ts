import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/authRoutes";
import { ROUTE_CATALOG } from "./lib/routeCatalog";
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

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: corsOrigin, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));
  app.use(rateLimit({ windowMs: 60_000, limit: 120 }));

  app.get("/health", (_request, response) => {
    response.json({ ok: true, service: "backend_api" });
  });

  app.get("/v1/status", (_request, response) => {
    response.json({
      ok: true,
      service: "backend_api",
      environment: env.NODE_ENV,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/v1/routes", (_request, response) => {
    response.json({
      service: "backend_api",
      version: 1,
      routes: ROUTE_CATALOG,
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/quizzes", quizRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/monitoring", monitoringRoutes);

  app.use(errorHandler);
  return app;
}
