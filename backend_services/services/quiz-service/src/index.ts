import { createServiceServer } from "./server";
import { registerRoutes } from "./routes";

const port = Number(process.env.PORT ?? 7003);

async function bootstrap() {
  const app = createServiceServer({ serviceName: "quiz-service", port, registerRoutes });
  try {
    await app.listen({ port, host: "0.0.0.0" });
    app.log.info({ port }, "Quiz service started");
  } catch (error) {
    app.log.fatal({ err: error }, "Quiz service failed to start");
    process.exit(1);
  }
}

void bootstrap();
