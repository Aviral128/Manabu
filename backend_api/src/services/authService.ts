import bcrypt from "bcryptjs";
import { Prisma, Role, UserStatus } from "@prisma/client";

import { env } from "../config/env";
import {
  demoDeleteUser,
  demoFindUserByEmail,
  demoForgotPassword,
  demoGetProfile,
  demoListUsers,
  demoRequestMagicLogin,
  demoResetPassword,
  demoSignup,
  demoUpdateProfile,
  demoUpdateUser,
  demoVerifyMagicLogin,
  shouldUseAuthDemoStore,
} from "../lib/authDemoStore";
import { prisma } from "../lib/prisma";
import { sendMagicLoginEmail, sendPasswordResetEmail } from "./emailService";
import { AppError } from "../utils/appError";
import { signToken } from "../utils/jwt";
import { generateMagicToken } from "../utils/magicToken";

type DatabaseClient = typeof prisma | Prisma.TransactionClient;

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  avatarUrl: string | null;
  isEmailVerified: boolean;
};

function toRole(email: string): Role {
  return env.adminEmails.includes(email.toLowerCase()) || email.toLowerCase().includes("aviral") ? Role.ADMIN : Role.LEARNER;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function roleLabel(role: Role): "admin" | "learner" {
  return role === Role.ADMIN ? "admin" : "learner";
}

function statusLabel(status: UserStatus): "pending" | "active" | "suspended" {
  if (status === UserStatus.PENDING) return "pending";
  if (status === UserStatus.SUSPENDED) return "suspended";
  return "active";
}

function deriveDisplayName(email: string) {
  const local = email.split("@")[0] ?? "learner";
  return (
    local
      .replace(/[._-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (character) => character.toUpperCase()) || "Learner"
  );
}

function buildUserPayload(user: UserRecord) {
  return {
    userId: user.id,
    displayName: user.name,
    email: user.email,
    role: roleLabel(user.role),
    status: statusLabel(user.status),
    isEmailVerified: user.isEmailVerified,
    avatarUrl: user.avatarUrl ?? undefined,
  };
}

function ensureAccountNotSuspended(status: UserStatus) {
  if (status === UserStatus.SUSPENDED) {
    throw new AppError(403, "ACCOUNT_SUSPENDED", "This account is suspended. Contact an administrator.");
  }
}

function ensurePasswordLoginAvailable(passwordHash: string | null): asserts passwordHash is string {
  if (!passwordHash) {
    throw new AppError(400, "PASSWORD_LOGIN_UNAVAILABLE", "Use a magic link or reset your password to set a password.");
  }
}

function buildMagicLoginLink(token: string) {
  return `${env.webBaseUrl}/auth/verify?token=${encodeURIComponent(token)}`;
}

function buildPasswordResetLink(token: string) {
  return `${env.webBaseUrl}/reset-password?token=${encodeURIComponent(token)}`;
}

function getTokenExpiryDate() {
  return new Date(Date.now() + env.magicLinkExpiryMinutes * 60_000);
}

async function ensureLeaderboard(client: DatabaseClient, userId: string) {
  await client.leaderboard.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      points: 0,
      level: 1,
      badges: [],
      streak: 0,
    },
  });
}

async function issueMagicLinkToken(client: DatabaseClient, email: string) {
  const token = generateMagicToken();

  await client.magicLinkToken.deleteMany({
    where: { email },
  });

  await client.magicLinkToken.create({
    data: {
      email,
      token,
      expiresAt: getTokenExpiryDate(),
    },
  });

  return token;
}

async function issuePasswordResetToken(client: DatabaseClient, email: string) {
  const token = generateMagicToken();

  await client.passwordResetToken.deleteMany({
    where: { email },
  });

  await client.passwordResetToken.create({
    data: {
      email,
      token,
      expiresAt: getTokenExpiryDate(),
    },
  });

  return token;
}

async function consumeMagicLinkToken(client: DatabaseClient, token: string) {
  const record = await client.magicLinkToken.findUnique({
    where: { token },
  });

  if (!record || record.expiresAt.getTime() <= Date.now()) {
    if (record) {
      await client.magicLinkToken.delete({ where: { id: record.id } });
    }
    throw new AppError(400, "INVALID_MAGIC_LINK", "This login link is invalid or has expired.");
  }

  await client.magicLinkToken.delete({
    where: { id: record.id },
  });

  return record.email;
}

async function consumePasswordResetToken(client: DatabaseClient, token: string) {
  const record = await client.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record || record.expiresAt.getTime() <= Date.now()) {
    if (record) {
      await client.passwordResetToken.delete({ where: { id: record.id } });
    }
    throw new AppError(400, "INVALID_RESET_LINK", "This password reset link is invalid or has expired.");
  }

  await client.passwordResetToken.delete({
    where: { id: record.id },
  });

  return record.email;
}

async function activateOrCreateUser(client: DatabaseClient, email: string) {
  const existing = await client.user.findUnique({ where: { email } });

  if (existing) {
    ensureAccountNotSuspended(existing.status);

    const user =
      existing.status !== UserStatus.ACTIVE || !existing.isEmailVerified
        ? await client.user.update({
            where: { id: existing.id },
            data: {
              status: UserStatus.ACTIVE,
              isEmailVerified: true,
              name: existing.name || deriveDisplayName(email),
            },
          })
        : existing;

    await ensureLeaderboard(client, user.id);
    return user;
  }

  const user = await client.user.create({
    data: {
      email,
      name: deriveDisplayName(email),
      passwordHash: null,
      role: toRole(email),
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
    },
  });

  await ensureLeaderboard(client, user.id);
  return user;
}

async function sendResetEmailBestEffort(email: string, link: string) {
  try {
    await sendPasswordResetEmail(email, link);
  } catch (error) {
    console.error("password_reset_email_failed", { email, error });
  }
}

export async function signup(input: { name: string; email: string; password: string }) {
  const email = normalizeEmail(input.email);
  const passwordHash = await bcrypt.hash(input.password, 10);
  const role = toRole(email);

  try {
    const user = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({ where: { email } });

      if (existing) {
        ensureAccountNotSuspended(existing.status);

        if (existing.passwordHash) {
          throw new AppError(409, "EMAIL_EXISTS", "An account with this email already exists.");
        }

        const updated = await tx.user.update({
          where: { id: existing.id },
          data: {
            name: input.name.trim(),
            passwordHash,
            role,
            status: UserStatus.ACTIVE,
            isEmailVerified: true,
          },
        });

        await ensureLeaderboard(tx, updated.id);
        return updated;
      }

      const created = await tx.user.create({
        data: {
          name: input.name.trim(),
          email,
          passwordHash,
          role,
          status: UserStatus.ACTIVE,
          isEmailVerified: true,
        },
      });

      await ensureLeaderboard(tx, created.id);
      return created;
    });

    const token = signToken({ userId: user.id, email: user.email, role: roleLabel(user.role) });
    return { success: true as const, user: buildUserPayload(user), token };
  } catch (error) {
    if (!shouldUseAuthDemoStore(error)) throw error;

    const user = await demoSignup(input, role);
    const token = signToken({ userId: user.id, email: user.email, role: roleLabel(user.role) });
    return { success: true as const, user: buildUserPayload(user), token };
  }
}

export async function requestMagicLogin(input: { email: string }) {
  const email = normalizeEmail(input.email);
  const response = {
    success: true as const,
    message: "Login link sent if email exists",
  };

  try {
    const token = await prisma.$transaction(async (tx) => issueMagicLinkToken(tx, email));
    await sendMagicLoginEmail(email, buildMagicLoginLink(token));
    return response;
  } catch (error) {
    if (!shouldUseAuthDemoStore(error)) throw error;

    const token = await demoRequestMagicLogin(email);
    await sendMagicLoginEmail(email, buildMagicLoginLink(token));
    return response;
  }
}

export async function verifyMagicLogin(token: string) {
  const rawToken = token.trim();
  if (!rawToken) {
    throw new AppError(400, "INVALID_MAGIC_LINK", "This login link is invalid or has expired.");
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      const email = await consumeMagicLinkToken(tx, rawToken);
      return activateOrCreateUser(tx, email);
    });

    const jwt = signToken({ userId: user.id, email: user.email, role: roleLabel(user.role) });
    return { success: true as const, token: jwt, user: buildUserPayload(user) };
  } catch (error) {
    if (!shouldUseAuthDemoStore(error)) throw error;

    const user = await demoVerifyMagicLogin(rawToken);
    const jwt = signToken({ userId: user.id, email: user.email, role: roleLabel(user.role) });
    return { success: true as const, token: jwt, user: buildUserPayload(user) };
  }
}

export async function login(input: { email: string; password: string }) {
  const email = normalizeEmail(input.email);

  try {
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError(404, "ACCOUNT_NOT_FOUND", "No account was found for this email.");
    }

    ensureAccountNotSuspended(user.status);
    ensurePasswordLoginAvailable(user.passwordHash);

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, "INVALID_PASSWORD", "Incorrect password.");
    }

    if (user.status !== UserStatus.ACTIVE || !user.isEmailVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          status: UserStatus.ACTIVE,
          isEmailVerified: true,
        },
      });
    }

    const token = signToken({ userId: user.id, email: user.email, role: roleLabel(user.role) });
    return { success: true as const, user: buildUserPayload(user), token };
  } catch (error) {
    if (!shouldUseAuthDemoStore(error)) throw error;

    const user = await demoFindUserByEmail(email);
    if (!user) {
      throw new AppError(404, "ACCOUNT_NOT_FOUND", "No account was found for this email.");
    }

    ensureAccountNotSuspended(user.status);
    ensurePasswordLoginAvailable(user.passwordHash);

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, "INVALID_PASSWORD", "Incorrect password.");
    }

    const token = signToken({ userId: user.id, email: user.email, role: roleLabel(user.role) });
    return { success: true as const, user: buildUserPayload(user), token };
  }
}

export async function forgotPassword(input: { email: string }) {
  const email = normalizeEmail(input.email);
  const response = {
    success: true as const,
    message: "If the account exists, a reset link has been sent.",
  };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.status === UserStatus.SUSPENDED) {
      return response;
    }

    const token = await prisma.$transaction(async (tx) => issuePasswordResetToken(tx, email));
    await sendResetEmailBestEffort(email, buildPasswordResetLink(token));
    return response;
  } catch (error) {
    if (!shouldUseAuthDemoStore(error)) throw error;

    const token = await demoForgotPassword(email);
    if (token) {
      await sendResetEmailBestEffort(email, buildPasswordResetLink(token));
    }
    return response;
  }
}

export async function resetPassword(input: { token: string; newPassword: string }) {
  const rawToken = input.token.trim();
  if (!rawToken) {
    throw new AppError(400, "INVALID_RESET_LINK", "This password reset link is invalid or has expired.");
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 10);

  try {
    await prisma.$transaction(async (tx) => {
      const email = await consumePasswordResetToken(tx, rawToken);
      const user = await tx.user.findUnique({ where: { email } });
      if (!user) {
        throw new AppError(400, "INVALID_RESET_LINK", "This password reset link is invalid or has expired.");
      }

      ensureAccountNotSuspended(user.status);

      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          status: UserStatus.ACTIVE,
          isEmailVerified: true,
        },
      });

      await ensureLeaderboard(tx, user.id);
    });

    return { success: true as const, message: "Password reset successfully." };
  } catch (error) {
    if (!shouldUseAuthDemoStore(error)) throw error;

    await demoResetPassword({
      token: rawToken,
      newPassword: input.newPassword,
    });

    return { success: true as const, message: "Password reset successfully." };
  }
}

export async function getProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        leaderboard: true,
        attempts: {
          orderBy: { completedAt: "desc" },
          take: 8,
          include: { quiz: true },
        },
      },
    });

    if (!user) {
      throw new AppError(404, "PROFILE_NOT_FOUND", "User profile not found.");
    }

    return {
      ...buildUserPayload(user),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      leaderboard: user.leaderboard,
      recentAttempts: user.attempts.map((attempt) => ({
        attemptId: attempt.id,
        quizId: attempt.quizId,
        quizTitle: attempt.quiz.title,
        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        completedAt: attempt.completedAt,
      })),
    };
  } catch (error) {
    if (!shouldUseAuthDemoStore(error)) throw error;
    const result = await demoGetProfile(userId);
    return {
      ...buildUserPayload(result.user),
      createdAt: result.user.createdAt,
      updatedAt: result.user.updatedAt,
      leaderboard: result.leaderboard,
      recentAttempts: result.recentAttempts,
    };
  }
}

export async function updateProfile(userId: string, input: { displayName?: string; avatarUrl?: string | null }) {
  const data: { name?: string; avatarUrl?: string | null } = {};
  if (typeof input.displayName === "string") {
    data.name = input.displayName.trim();
  }
  if ("avatarUrl" in input) {
    data.avatarUrl = input.avatarUrl?.trim() || null;
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return buildUserPayload(user);
  } catch (error) {
    if (!shouldUseAuthDemoStore(error)) throw error;
    const user = await demoUpdateProfile(userId, input);
    return buildUserPayload(user);
  }
}

export async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        leaderboard: true,
        _count: { select: { attempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return users.map((user) => ({
      ...buildUserPayload(user),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      points: user.leaderboard?.points ?? 0,
      level: user.leaderboard?.level ?? 1,
      streak: user.leaderboard?.streak ?? 0,
      attempts: user._count.attempts,
    }));
  } catch (error) {
    if (!shouldUseAuthDemoStore(error)) throw error;
    const users = await demoListUsers();
    return users.map(({ user, leaderboard, attempts }) => ({
      ...buildUserPayload(user),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      points: leaderboard.points,
      level: leaderboard.level,
      streak: leaderboard.streak,
      attempts,
    }));
  }
}

export async function updateUser(
  userId: string,
  input: { displayName?: string; role?: "admin" | "learner"; status?: "pending" | "active" | "suspended"; avatarUrl?: string | null }
) {
  const data: {
    name?: string;
    role?: Role;
    status?: UserStatus;
    isEmailVerified?: boolean;
    avatarUrl?: string | null;
  } = {};

  if (typeof input.displayName === "string") {
    data.name = input.displayName.trim();
  }
  if (input.role) {
    data.role = input.role === "admin" ? Role.ADMIN : Role.LEARNER;
  }
  if (input.status) {
    data.status =
      input.status === "suspended" ? UserStatus.SUSPENDED : input.status === "pending" ? UserStatus.PENDING : UserStatus.ACTIVE;
    if (input.status === "pending") {
      data.isEmailVerified = false;
    }
    if (input.status === "active") {
      data.isEmailVerified = true;
    }
  }
  if ("avatarUrl" in input) {
    data.avatarUrl = input.avatarUrl?.trim() || null;
  }

  try {
    const user = await prisma.user.update({ where: { id: userId }, data });
    return buildUserPayload(user);
  } catch (error) {
    if (!shouldUseAuthDemoStore(error)) throw error;
    const user = await demoUpdateUser(userId, input);
    return buildUserPayload(user);
  }
}

export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({ where: { id: userId } });
    return { success: true as const };
  } catch (error) {
    if (!shouldUseAuthDemoStore(error)) throw error;
    return demoDeleteUser(userId);
  }
}
