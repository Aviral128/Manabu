import { createServiceServer } from "./server";
import { registerRoutes } from "./routes";

const port = Number(process.env.PORT ?? 7000);

async function bootstrap() {
  const app = createServiceServer({
    serviceName: "api-gateway",
    port,
    registerRoutes
  });

  try {
    await app.listen({ port, host: "0.0.0.0" });
    app.log.info({ port }, "API Gateway started");
  } catch (error) {
    app.log.fatal({ err: error }, "API Gateway failed to start");
    process.exit(1);
  }
}

void bootstrap();
