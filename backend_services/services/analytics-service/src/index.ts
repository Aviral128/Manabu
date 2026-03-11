import { createServiceServer } from "./server";
import { registerRoutes } from "./routes";

const port = Number(process.env.PORT ?? 7007);

async function bootstrap() {
  const app = createServiceServer({ serviceName: "analytics-service", port, registerRoutes });
  try {
    await app.listen({ port, host: "0.0.0.0" });
    app.log.info({ port }, "Analytics service started");
  } catch (error) {
    app.log.fatal({ err: error }, "Analytics service failed to start");
    process.exit(1);
  }
}

void bootstrap();
