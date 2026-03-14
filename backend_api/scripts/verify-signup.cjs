const path = require("node:path");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  const { createApp } = require("../dist/app");
  const prisma = new PrismaClient();
  const email = `codex-signup-${Date.now()}@example.com`;
  const password = "StrongPass123";
  const app = createApp();

  try {
    const payload = await new Promise((resolve, reject) => {
      const server = app.listen(0, "127.0.0.1", async () => {
        const address = server.address();

        try {
          const signupResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/signup`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              name: "Codex Signup",
              email,
              password,
            }),
          });

          const signupBody = await signupResponse.json();
          if (signupResponse.status !== 201 || signupBody.success !== true || signupBody.user?.email !== email || !signupBody.token) {
            throw new Error(`Signup smoke test failed with status ${signupResponse.status}: ${JSON.stringify(signupBody)}`);
          }

          const loginResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/login`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const loginBody = await loginResponse.json();
          if (loginResponse.status !== 200 || loginBody.success !== true || !loginBody.token) {
            throw new Error(`Password login smoke test failed with status ${loginResponse.status}: ${JSON.stringify(loginBody)}`);
          }

          resolve({
            signup: { status: signupResponse.status, body: signupBody },
            login: { status: loginResponse.status, body: loginBody },
          });
        } catch (error) {
          reject(error);
        } finally {
          server.close();
        }
      });
    });

    console.log(`Verified signup + password login flow: ${JSON.stringify(payload)}`);
  } finally {
    await prisma.passwordResetToken.deleteMany({ where: { email } });
    await prisma.magicLinkToken.deleteMany({ where: { email } });
    await prisma.leaderboard.deleteMany({ where: { user: { email } } });
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
