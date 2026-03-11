import { createServiceServer } from "./server";
import { registerRoutes } from "./routes";

const port = Number(process.env.PORT ?? 7011);

async function bootstrap() {
  const app = createServiceServer({ serviceName: "recommendation-service", port, registerRoutes });
  try {
    await app.listen({ port, host: "0.0.0.0" });
    app.log.info({ port }, "Recommendation service started");
  } catch (error) {
    app.log.fatal({ err: error }, "Recommendation service failed to start");
    process.exit(1);
  }
}

void bootstrap();
