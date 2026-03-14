const path = require("node:path");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  const { createApp } = require("../dist/app");
  const prisma = new PrismaClient();
  const email = `codex-magic-${Date.now()}@example.com`;
  const app = createApp();

  try {
    const payload = await new Promise((resolve, reject) => {
      const server = app.listen(0, "127.0.0.1", async () => {
        const address = server.address();

        try {
          const magicResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/magic-login`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email }),
          });

          const magicBody = await magicResponse.json();
          if (magicResponse.status !== 200 || magicBody.success !== true) {
            throw new Error(`Magic login request failed with status ${magicResponse.status}: ${JSON.stringify(magicBody)}`);
          }

          const tokenRecord = await prisma.magicLinkToken.findFirst({
            where: { email },
            orderBy: { createdAt: "desc" },
          });

          if (!tokenRecord?.token) {
            throw new Error("Magic-login flow did not create a magic link token.");
          }

          const verifyResponse = await fetch(
            `http://127.0.0.1:${address.port}/api/auth/verify-magic?token=${encodeURIComponent(tokenRecord.token)}`,
            {
              method: "GET",
              headers: { "content-type": "application/json" },
            }
          );

          const verifyBody = await verifyResponse.json();
          if (verifyResponse.status !== 200 || verifyBody.success !== true || !verifyBody.token || verifyBody.user?.email !== email) {
            throw new Error(`Magic login verification failed with status ${verifyResponse.status}: ${JSON.stringify(verifyBody)}`);
          }

          resolve({
            request: { status: magicResponse.status, body: magicBody },
            verify: { status: verifyResponse.status, body: verifyBody },
          });
        } catch (error) {
          reject(error);
        } finally {
          server.close();
        }
      });
    });

    console.log(`Verified magic login flow: ${JSON.stringify(payload)}`);
  } finally {
    await prisma.magicLinkToken.deleteMany({ where: { email } });
    await prisma.passwordResetToken.deleteMany({ where: { email } });
    await prisma.leaderboard.deleteMany({ where: { user: { email } } });
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
