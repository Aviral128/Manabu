const path = require("node:path");
const dotenv = require("dotenv");
const { PrismaClient, EmailOTPType } = require("@prisma/client");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  const { createApp } = require("../dist/app");
  const { hashOtpCode } = require("../dist/utils/otp");
  const prisma = new PrismaClient();
  const email = `codex-smoke-${Date.now()}@example.com`;
  const otp = "123456";
  const app = createApp();

  try {
    const signupPayload = await new Promise((resolve, reject) => {
      const server = app.listen(0, "127.0.0.1", async () => {
        const address = server.address();

        try {
          const signupResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/signup`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              name: "Codex Smoke",
              email,
              password: "StrongPass123",
            }),
          });

          const signupBody = await signupResponse.json();
          if (
            signupResponse.status !== 201 ||
            signupBody.success !== true ||
            signupBody.requiresEmailVerification !== true ||
            signupBody.user?.status !== "pending"
          ) {
            throw new Error(`Signup smoke test failed with status ${signupResponse.status}: ${JSON.stringify(signupBody)}`);
          }

          await prisma.emailOTP.deleteMany({
            where: { email, type: EmailOTPType.VERIFY_EMAIL },
          });

          await prisma.emailOTP.create({
            data: {
              email,
              otpHash: hashOtpCode(email, EmailOTPType.VERIFY_EMAIL, otp),
              type: EmailOTPType.VERIFY_EMAIL,
              expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
          });

          const verifyResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/verify-email`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email, otp }),
          });

          const verifyBody = await verifyResponse.json();
          if (verifyResponse.status !== 200 || verifyBody.success !== true || verifyBody.user?.status !== "active" || !verifyBody.token) {
            throw new Error(`Verify email smoke test failed with status ${verifyResponse.status}: ${JSON.stringify(verifyBody)}`);
          }

          resolve({
            signup: { status: signupResponse.status, body: signupBody },
            verifyEmail: { status: verifyResponse.status, body: verifyBody },
          });
        } catch (error) {
          reject(error);
        } finally {
          server.close();
        }
      });
    });

    console.log(`Verified OTP signup flow: ${JSON.stringify(signupPayload)}`);
  } finally {
    await prisma.emailOTP.deleteMany({ where: { email } });
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
