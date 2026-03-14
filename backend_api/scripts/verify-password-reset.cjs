const path = require("node:path");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const { PrismaClient, Role, UserStatus } = require("@prisma/client");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  const { createApp } = require("../dist/app");
  const prisma = new PrismaClient();
  const email = `codex-reset-${Date.now()}@example.com`;
  const oldPassword = "OldStrongPass123";
  const newPassword = "NewStrongPass123";
  const app = createApp();

  try {
    await prisma.user.create({
      data: {
        name: "Reset Smoke",
        email,
        passwordHash: await bcrypt.hash(oldPassword, 10),
        role: Role.LEARNER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
      },
    });

    const payload = await new Promise((resolve, reject) => {
      const server = app.listen(0, "127.0.0.1", async () => {
        const address = server.address();

        try {
          const forgotResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/forgot-password`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email }),
          });

          const forgotBody = await forgotResponse.json();
          if (forgotResponse.status !== 200 || forgotBody.success !== true) {
            throw new Error(`Forgot password smoke test failed with status ${forgotResponse.status}: ${JSON.stringify(forgotBody)}`);
          }

          const resetTokenRecord = await prisma.passwordResetToken.findFirst({
            where: { email },
            orderBy: { createdAt: "desc" },
          });

          if (!resetTokenRecord?.token) {
            throw new Error("Forgot-password flow did not create a password reset token.");
          }

          const resetResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/reset-password`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ token: resetTokenRecord.token, newPassword }),
          });

          const resetBody = await resetResponse.json();
          if (resetResponse.status !== 200 || resetBody.success !== true) {
            throw new Error(`Reset password smoke test failed with status ${resetResponse.status}: ${JSON.stringify(resetBody)}`);
          }

          const loginResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/login`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email, password: newPassword }),
          });

          const loginBody = await loginResponse.json();
          if (loginResponse.status !== 200 || loginBody.success !== true || !loginBody.token) {
            throw new Error(`Login-after-reset smoke test failed with status ${loginResponse.status}: ${JSON.stringify(loginBody)}`);
          }

          resolve({
            forgotPassword: { status: forgotResponse.status, body: forgotBody },
            resetPassword: { status: resetResponse.status, body: resetBody },
            login: { status: loginResponse.status, body: loginBody },
          });
        } catch (error) {
          reject(error);
        } finally {
          server.close();
        }
      });
    });

    console.log(`Verified password reset flow: ${JSON.stringify(payload)}`);
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
