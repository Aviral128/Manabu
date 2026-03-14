const path = require("node:path");
const dotenv = require("dotenv");
const { PrismaClient, UserStatus } = require("@prisma/client");

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
          if (signupResponse.status !== 201 || signupBody.success !== true || signupBody.requiresVerification !== true) {
            throw new Error(`Signup smoke test failed with status ${signupResponse.status}: ${JSON.stringify(signupBody)}`);
          }

          const pendingUser = await prisma.user.findUnique({ where: { email } });
          if (!pendingUser || pendingUser.isEmailVerified !== false || pendingUser.status !== UserStatus.PENDING) {
            throw new Error("Signup flow did not create a pending unverified user.");
          }

          const verificationTokenRecord = await prisma.emailVerificationToken.findFirst({
            where: { userId: pendingUser.id },
            orderBy: { createdAt: "desc" },
          });

          if (!verificationTokenRecord?.token) {
            throw new Error("Signup flow did not create an email verification token.");
          }

          const blockedLoginResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/login`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const blockedLoginBody = await blockedLoginResponse.json();
          if (blockedLoginResponse.status !== 403 || blockedLoginBody.code !== "EMAIL_NOT_VERIFIED") {
            throw new Error(`Unverified password login was not blocked: ${JSON.stringify(blockedLoginBody)}`);
          }

          const magicResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/magic-login`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email }),
          });

          const magicBody = await magicResponse.json();
          if (magicResponse.status !== 200 || magicBody.success !== true) {
            throw new Error(`Magic login request failed with status ${magicResponse.status}: ${JSON.stringify(magicBody)}`);
          }

          const magicTokenRecord = await prisma.magicLinkToken.findFirst({
            where: { email },
            orderBy: { createdAt: "desc" },
          });

          if (magicTokenRecord) {
            throw new Error("Magic login should not issue tokens for unverified accounts.");
          }

          const verifyResponse = await fetch(
            `http://127.0.0.1:${address.port}/api/auth/verify-email?token=${encodeURIComponent(verificationTokenRecord.token)}`,
            {
              method: "GET",
              headers: { "content-type": "application/json" },
            }
          );

          const verifyBody = await verifyResponse.json();
          if (verifyResponse.status !== 200 || verifyBody.success !== true) {
            throw new Error(`Email verification failed with status ${verifyResponse.status}: ${JSON.stringify(verifyBody)}`);
          }

          const verifiedUser = await prisma.user.findUnique({ where: { email } });
          if (!verifiedUser || verifiedUser.isEmailVerified !== true || verifiedUser.status !== UserStatus.ACTIVE) {
            throw new Error("Email verification did not activate the user.");
          }

          const deletedVerificationToken = await prisma.emailVerificationToken.findUnique({
            where: { token: verificationTokenRecord.token },
          });

          if (deletedVerificationToken) {
            throw new Error("Verification token was not deleted after successful use.");
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
            blockedLogin: { status: blockedLoginResponse.status, body: blockedLoginBody },
            verifyEmail: { status: verifyResponse.status, body: verifyBody },
            login: { status: loginResponse.status, body: loginBody },
          });
        } catch (error) {
          reject(error);
        } finally {
          server.close();
        }
      });
    });

    console.log(`Verified signup + email verification + password login flow: ${JSON.stringify(payload)}`);
  } finally {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      await prisma.emailVerificationToken.deleteMany({ where: { userId: existingUser.id } });
      await prisma.leaderboard.deleteMany({ where: { userId: existingUser.id } });
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
