import { createServiceServer } from "./server";
import { registerRoutes } from "./routes";

const port = Number(process.env.PORT ?? 7009);

async function bootstrap() {
  const app = createServiceServer({ serviceName: "notification-service", port, registerRoutes });
  try {
    await app.listen({ port, host: "0.0.0.0" });
    app.log.info({ port }, "Notification service started");
  } catch (error) {
    app.log.fatal({ err: error }, "Notification service failed to start");
    process.exit(1);
  }
}

void bootstrap();
