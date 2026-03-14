const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  const { createApp } = require("../dist/app");
  const app = createApp();

  const payload = await new Promise((resolve, reject) => {
    const server = app.listen(0, "127.0.0.1", async () => {
      const address = server.address();

      try {
        const [statusResponse, routesResponse] = await Promise.all([
          fetch(`http://127.0.0.1:${address.port}/v1/status`),
          fetch(`http://127.0.0.1:${address.port}/v1/routes`),
        ]);

        const statusBody = await statusResponse.json();
        const routesBody = await routesResponse.json();

        if (!statusResponse.ok || statusBody.ok !== true || statusBody.service !== "backend_api") {
          throw new Error(`Route status check failed with status ${statusResponse.status}: ${JSON.stringify(statusBody)}`);
        }

        if (!routesResponse.ok || routesBody.service !== "backend_api" || !Array.isArray(routesBody.routes) || routesBody.routes.length < 10) {
          throw new Error(`Route catalog check failed with status ${routesResponse.status}: ${JSON.stringify(routesBody)}`);
        }

        resolve({
          status: { status: statusResponse.status, body: statusBody },
          routes: { status: routesResponse.status, routeCount: routesBody.routes.length },
        });
      } catch (error) {
        reject(error);
      } finally {
        server.close();
      }
    });
  });

  console.log(`Verified route catalog: ${JSON.stringify(payload)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
