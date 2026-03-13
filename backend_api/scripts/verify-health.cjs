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
        const response = await fetch(`http://127.0.0.1:${address.port}/health`);
        const body = await response.json();

        if (!response.ok || body.ok !== true) {
          throw new Error(`Healthcheck failed with status ${response.status}: ${JSON.stringify(body)}`);
        }

        resolve({ status: response.status, body });
      } catch (error) {
        reject(error);
      } finally {
        server.close();
      }
    });
  });

  console.log(`Verified /health: ${JSON.stringify(payload)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
