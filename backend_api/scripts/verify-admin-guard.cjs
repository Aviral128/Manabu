const path = require("node:path");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const { PrismaClient, Role, UserStatus } = require("@prisma/client");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  const { createApp } = require("../dist/app");
  const prisma = new PrismaClient();
  const email = `codex-admin-guard-${Date.now()}@example.com`;
  const password = "StrongPass123";
  let userId = "";

  try {
    const createdUser = await prisma.user.create({
      data: {
        name: "Admin Guard Smoke",
        email,
        passwordHash: await bcrypt.hash(password, 10),
        role: Role.LEARNER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
      },
    });
    userId = createdUser.id;

    const payload = await new Promise((resolve, reject) => {
      const app = createApp();
      const server = app.listen(0, "127.0.0.1", async () => {
        const address = server.address();

        try {
          const loginResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/login`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const loginBody = await loginResponse.json();

          if (loginResponse.status !== 200 || !loginBody.token) {
            throw new Error(`Learner login failed: ${loginResponse.status} ${JSON.stringify(loginBody)}`);
          }

          const adminResponse = await fetch(`http://127.0.0.1:${address.port}/api/admin/summary`, {
            method: "GET",
            headers: { Authorization: `Bearer ${loginBody.token}` },
          });
          const adminBody = await adminResponse.json();

          if (adminResponse.status !== 403 || adminBody.code !== "FORBIDDEN") {
            throw new Error(`Admin guard failed: ${adminResponse.status} ${JSON.stringify(adminBody)}`);
          }

          resolve({
            login: { status: loginResponse.status },
            admin: { status: adminResponse.status, body: adminBody },
          });
        } catch (error) {
          reject(error);
        } finally {
          server.close();
        }
      });
    });

    console.log(`Verified admin guard: ${JSON.stringify(payload)}`);
  } finally {
    if (userId) {
      await prisma.emailVerificationToken.deleteMany({ where: { userId } });
      await prisma.leaderboard.deleteMany({ where: { userId } });
    }
    await prisma.passwordResetToken.deleteMany({ where: { email } });
    await prisma.magicLinkToken.deleteMany({ where: { email } });
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
