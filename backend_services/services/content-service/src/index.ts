import { createServiceServer } from "./server";
import { registerRoutes } from "./routes";

const port = Number(process.env.PORT ?? 7008);

async function bootstrap() {
  const app = createServiceServer({ serviceName: "content-service", port, registerRoutes });
  try {
    await app.listen({ port, host: "0.0.0.0" });
    app.log.info({ port }, "Content service started");
  } catch (error) {
    app.log.fatal({ err: error }, "Content service failed to start");
    process.exit(1);
  }
}

void bootstrap();
