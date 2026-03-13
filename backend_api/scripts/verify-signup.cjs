const path = require("node:path");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  const { createApp } = require("../dist/app");
  const prisma = new PrismaClient();
  const email = `codex-smoke-${Date.now()}@example.com`;
  const app = createApp();

  try {
    const payload = await new Promise((resolve, reject) => {
      const server = app.listen(0, "127.0.0.1", async () => {
        const address = server.address();

        try {
          const response = await fetch(`http://127.0.0.1:${address.port}/api/auth/signup`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              name: "Codex Smoke",
              email,
              password: "StrongPass123",
            }),
          });

          const body = await response.json();
          if (response.status !== 201 || body.success !== true || !body.user?.userId) {
            throw new Error(`Signup smoke test failed with status ${response.status}: ${JSON.stringify(body)}`);
          }

          resolve({ status: response.status, body });
        } catch (error) {
          reject(error);
        } finally {
          server.close();
        }
      });
    });

    console.log(`Verified /api/auth/signup: ${JSON.stringify(payload)}`);
  } finally {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
