const path = require("node:path");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const { PrismaClient, Role, UserStatus } = require("@prisma/client");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  const { createApp } = require("../dist/app");
  const prisma = new PrismaClient();
  const baseStamp = Date.now();
  const existingEmail = `codex-existing-${baseStamp}@example.com`;
  const unverifiedEmail = `codex-unverified-${baseStamp}@example.com`;
  const expiredMagicEmail = `codex-expired-magic-${baseStamp}@example.com`;
  const resetReuseEmail = `codex-reset-reuse-${baseStamp}@example.com`;
  const validPassword = "StrongPass123";
  const newPassword = "NewStrongPass123";
  const app = createApp();

  try {
    await prisma.user.create({
      data: {
        name: "Existing User",
        email: existingEmail,
        passwordHash: await bcrypt.hash(validPassword, 10),
        role: Role.LEARNER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
      },
    });

    await prisma.user.create({
      data: {
        name: "Pending User",
        email: unverifiedEmail,
        passwordHash: await bcrypt.hash(validPassword, 10),
        role: Role.LEARNER,
        status: UserStatus.PENDING,
        isEmailVerified: false,
      },
    });

    const expiredMagicUser = await prisma.user.create({
      data: {
        name: "Expired Magic",
        email: expiredMagicEmail,
        passwordHash: await bcrypt.hash(validPassword, 10),
        role: Role.LEARNER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
      },
    });

    await prisma.magicLinkToken.create({
      data: {
        email: expiredMagicEmail,
        token: `expired-magic-${baseStamp}`,
        expiresAt: new Date(Date.now() - 60_000),
      },
    });

    await prisma.user.create({
      data: {
        name: "Reset Reuse",
        email: resetReuseEmail,
        passwordHash: await bcrypt.hash(validPassword, 10),
        role: Role.LEARNER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
      },
    });

    const payload = await new Promise((resolve, reject) => {
      const server = app.listen(0, "127.0.0.1", async () => {
        const address = server.address();

        try {
          const invalidSignupResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/signup`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              name: "Broken Signup",
              email: "not-an-email",
              password: validPassword,
            }),
          });
          const invalidSignupBody = await invalidSignupResponse.json();
          if (invalidSignupResponse.status !== 400) {
            throw new Error(`Invalid-signup check failed: ${JSON.stringify(invalidSignupBody)}`);
          }

          const existingSignupResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/signup`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              name: "Existing Signup",
              email: existingEmail,
              password: validPassword,
            }),
          });
          const existingSignupBody = await existingSignupResponse.json();
          if (existingSignupResponse.status !== 409 || existingSignupBody.code !== "EMAIL_EXISTS") {
            throw new Error(`Existing-email signup check failed: ${JSON.stringify(existingSignupBody)}`);
          }

          const wrongPasswordResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/login`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email: existingEmail, password: "WrongPass123" }),
          });
          const wrongPasswordBody = await wrongPasswordResponse.json();
          if (wrongPasswordResponse.status !== 401 || wrongPasswordBody.code !== "INVALID_PASSWORD") {
            throw new Error(`Wrong-password check failed: ${JSON.stringify(wrongPasswordBody)}`);
          }

          const unverifiedLoginResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/login`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email: unverifiedEmail, password: validPassword }),
          });
          const unverifiedLoginBody = await unverifiedLoginResponse.json();
          if (unverifiedLoginResponse.status !== 403 || unverifiedLoginBody.code !== "EMAIL_NOT_VERIFIED") {
            throw new Error(`Unverified-login check failed: ${JSON.stringify(unverifiedLoginBody)}`);
          }

          const expiredMagicResponse = await fetch(
            `http://127.0.0.1:${address.port}/api/auth/verify-magic?token=${encodeURIComponent(`expired-magic-${baseStamp}`)}`,
            {
              method: "GET",
              headers: { "content-type": "application/json" },
            },
          );
          const expiredMagicBody = await expiredMagicResponse.json();
          if (expiredMagicResponse.status !== 400 || expiredMagicBody.code !== "INVALID_MAGIC_LINK") {
            throw new Error(`Expired-magic check failed: ${JSON.stringify(expiredMagicBody)}`);
          }

          const forgotPasswordResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/forgot-password`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email: resetReuseEmail }),
          });
          const forgotPasswordBody = await forgotPasswordResponse.json();
          if (forgotPasswordResponse.status !== 200 || forgotPasswordBody.success !== true) {
            throw new Error(`Forgot-password check failed: ${JSON.stringify(forgotPasswordBody)}`);
          }

          const resetTokenRecord = await prisma.passwordResetToken.findFirst({
            where: { email: resetReuseEmail },
            orderBy: { createdAt: "desc" },
          });
          if (!resetTokenRecord?.token) {
            throw new Error("Password-reset reuse check could not find a reset token.");
          }

          const resetOnceResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/reset-password`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ token: resetTokenRecord.token, newPassword }),
          });
          const resetOnceBody = await resetOnceResponse.json();
          if (resetOnceResponse.status !== 200 || resetOnceBody.success !== true) {
            throw new Error(`Reset-password first-use check failed: ${JSON.stringify(resetOnceBody)}`);
          }

          const resetReuseResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/reset-password`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ token: resetTokenRecord.token, newPassword: `${newPassword}x` }),
          });
          const resetReuseBody = await resetReuseResponse.json();
          if (resetReuseResponse.status !== 400 || resetReuseBody.code !== "INVALID_RESET_LINK") {
            throw new Error(`Reset-token reuse check failed: ${JSON.stringify(resetReuseBody)}`);
          }

          const invalidTokenResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/me`, {
            method: "GET",
            headers: {
              authorization: "Bearer not-a-valid-token",
            },
          });
          const invalidTokenBody = await invalidTokenResponse.json();
          if (invalidTokenResponse.status !== 401 || invalidTokenBody.code !== "INVALID_TOKEN") {
            throw new Error(`Invalid-session-token check failed: ${JSON.stringify(invalidTokenBody)}`);
          }

          resolve({
            invalidSignup: { status: invalidSignupResponse.status, body: invalidSignupBody },
            existingSignup: { status: existingSignupResponse.status, body: existingSignupBody },
            wrongPassword: { status: wrongPasswordResponse.status, body: wrongPasswordBody },
            unverifiedLogin: { status: unverifiedLoginResponse.status, body: unverifiedLoginBody },
            expiredMagic: { status: expiredMagicResponse.status, body: expiredMagicBody },
            resetOnce: { status: resetOnceResponse.status, body: resetOnceBody },
            resetReuse: { status: resetReuseResponse.status, body: resetReuseBody },
            invalidToken: { status: invalidTokenResponse.status, body: invalidTokenBody },
          });
        } catch (error) {
          reject(error);
        } finally {
          server.close();
        }
      });
    });

    console.log(`Verified auth edge cases: ${JSON.stringify(payload)}`);
  } finally {
    await prisma.magicLinkToken.deleteMany({ where: { email: expiredMagicEmail } });
    await prisma.passwordResetToken.deleteMany({
      where: { email: { in: [resetReuseEmail, existingEmail, unverifiedEmail, expiredMagicEmail] } },
    });
    await prisma.emailVerificationToken.deleteMany({
      where: {
        user: {
          email: { in: [existingEmail, unverifiedEmail, expiredMagicEmail, resetReuseEmail] },
        },
      },
    }).catch(() => undefined);
    await prisma.leaderboard.deleteMany({
      where: {
        user: {
          email: { in: [existingEmail, unverifiedEmail, expiredMagicEmail, resetReuseEmail] },
        },
      },
    }).catch(() => undefined);
    await prisma.user.deleteMany({
      where: {
        email: { in: [existingEmail, unverifiedEmail, expiredMagicEmail, resetReuseEmail] },
      },
    });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
