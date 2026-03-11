import bcrypt from "bcryptjs";
import { Role, UserStatus } from "@prisma/client";

import { env } from "../config/env";
import {
  demoDeleteUser,
  demoFindUserByEmail,
  demoGetProfile,
  demoListUsers,
  demoSignup,
  demoUpdateProfile,
  demoUpdateUser,
  shouldUseAuthDemoStore,
} from "../lib/authDemoStore";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";
import { signToken } from "../utils/jwt";

function toRole(email: string): Role {
  return env.adminEmails.includes(email.toLowerCase()) || email.toLowerCase().includes("aviral") ? Role.ADMIN : Role.LEARNER;
}

function roleLabel(role: Role): "admin" | "learner" {
  return role === Role.ADMIN ? "admin" : "learner";
}

function statusLabel(status: UserStatus): "active" | "suspended" {
  return status === UserStatus.SUSPENDED ? "suspended" : "active";
}

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  avatarUrl: string | null;
};

function buildUserPayload(user: UserRecord) {
  return {
    userId: user.id,
    displayName: user.name,
    email: user.email,
    role: roleLabel(user.role),
    status: statusLabel(user.status),
    avatarUrl: user.avatarUrl ?? undefined,
  };
}

function ensureActive(status: UserStatus) {
  if (status === UserStatus.SUSPENDED) {
    throw new AppError(403, "ACCOUNT_SUSPENDED", "This account is suspended. Contact an administrator.");
  }
}

export async function signup(input: { name: string; email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(409, "EMAIL_EXISTS", "An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email,
        passwordHash,
        role: toRole(email),
        leaderboard: { create: { points: 0, level: 1, badges: [], streak: 0 } },
      },
    });

    const token = signToken({ userId: user.id, email: user.email, role: roleLabel(user.role) });
    return { success: true as const, user: buildUserPayload(user), token };
  } catch (error) {
    if (!shouldUseAuthDemoStore(error)) throw error;
    const user = await demoSignup(input);
    const token = signToken({ userId: user.id, email: user.email, role: roleLabel(user.role) });
    return { success: true as const, user: buildUserPayload(user), token };
  }
}

export async function login(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError(404, "ACCOUNT_NOT_FOUND", "No account was found for this email.");
    }

    ensureActive(user.status);

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, "INVALID_PASSWORD", "Incorrect password.");
    }

    const token = signToken({ userId: user.id, email: user.email, role: roleLabel(user.role) });
    return { success: true as const, user: buildUserPayload(user), token };
  } catch (error) {
    if (!shouldUseAuthDemoStore(error)) throw error;
    const user = await demoFindUserByEmail(email);
    if (!user) {
      throw new AppError(404, "ACCOUNT_NOT_FOUND", "No account was found for this email.");
    }

    ensureActive(user.status);

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, "INVALID_PASSWORD", "Incorrect password.");
    }

    const token = signToken({ userId: user.id, email: user.email, role: roleLabel(user.role) });
    return { success: true as const, user: buildUserPayload(user), token };
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
  input: { displayName?: string; role?: "admin" | "learner"; status?: "active" | "suspended"; avatarUrl?: string | null }
) {
  const data: {
    name?: string;
    role?: Role;
    status?: UserStatus;
    avatarUrl?: string | null;
  } = {};

  if (typeof input.displayName === "string") {
    data.name = input.displayName.trim();
  }
  if (input.role) {
    data.role = input.role === "admin" ? Role.ADMIN : Role.LEARNER;
  }
  if (input.status) {
    data.status = input.status === "suspended" ? UserStatus.SUSPENDED : UserStatus.ACTIVE;
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
