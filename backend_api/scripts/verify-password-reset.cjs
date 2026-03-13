const path = require("node:path");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const { PrismaClient, EmailOTPType, Role, UserStatus } = require("@prisma/client");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  const { createApp } = require("../dist/app");
  const { hashOtpCode } = require("../dist/utils/otp");
  const prisma = new PrismaClient();
  const email = `codex-reset-${Date.now()}@example.com`;
  const otp = "654321";
  const newPassword = "NewStrongPass123";
  const app = createApp();

  try {
    await prisma.user.create({
      data: {
        name: "Reset Smoke",
        email,
        passwordHash: await bcrypt.hash("OldStrongPass123", 10),
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

          await prisma.emailOTP.deleteMany({
            where: { email, type: EmailOTPType.RESET_PASSWORD },
          });

          await prisma.emailOTP.create({
            data: {
              email,
              otpHash: hashOtpCode(email, EmailOTPType.RESET_PASSWORD, otp),
              type: EmailOTPType.RESET_PASSWORD,
              expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
          });

          const resetResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/reset-password`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email, otp, newPassword }),
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

    console.log(`Verified OTP password reset flow: ${JSON.stringify(payload)}`);
  } finally {
    await prisma.emailOTP.deleteMany({ where: { email } });
    await prisma.leaderboard.deleteMany({ where: { user: { email } } });
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
