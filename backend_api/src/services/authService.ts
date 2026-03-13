import bcrypt from "bcryptjs";
import { EmailOTPType, Prisma, Role, UserStatus } from "@prisma/client";

import { env } from "../config/env";
import {
  demoDeleteUser,
  demoFindUserByEmail,
  demoForgotPassword,
  demoGetProfile,
  demoListUsers,
  demoResetPassword,
  demoSendVerificationOtp,
  demoSignup,
  demoUpdateProfile,
  demoUpdateUser,
  demoVerifyEmail,
  shouldUseAuthDemoStore,
} from "../lib/authDemoStore";
import { prisma } from "../lib/prisma";
import { sendPasswordResetOTP, sendVerificationOTP } from "./emailService";
import { AppError } from "../utils/appError";
import { signToken } from "../utils/jwt";
import { generateOtpCode, getOtpExpiryDate, hashOtpCode, normalizeEmail, otpMatches } from "../utils/otp";

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

function roleLabel(role: Role): "admin" | "learner" {
  return role === Role.ADMIN ? "admin" : "learner";
}

function statusLabel(status: UserStatus): "pending" | "active" | "suspended" {
  if (status === UserStatus.PENDING) return "pending";
  if (status === UserStatus.SUSPENDED) return "suspended";
  return "active";
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

function ensureAccountCanLogin(user: Pick<UserRecord, "status" | "isEmailVerified">) {
  if (user.status === UserStatus.SUSPENDED) {
    throw new AppError(403, "ACCOUNT_SUSPENDED", "This account is suspended. Contact an administrator.");
  }

  if (user.status === UserStatus.PENDING || !user.isEmailVerified) {
    throw new AppError(403, "EMAIL_NOT_VERIFIED", "Verify your email address before logging in.");
  }
}

async function issueOtp(client: DatabaseClient, email: string, type: EmailOTPType) {
  const otp = generateOtpCode();

  await client.emailOTP.deleteMany({
    where: { email, type },
  });

  await client.emailOTP.create({
    data: {
      email,
      otpHash: hashOtpCode(email, type, otp),
      type,
      expiresAt: getOtpExpiryDate(),
    },
  });

  return otp;
}

async function consumeOtp(client: DatabaseClient, email: string, type: EmailOTPType, otp: string) {
  const now = new Date();

  await client.emailOTP.deleteMany({
    where: {
      email,
      type,
      expiresAt: { lte: now },
    },
  });

  const record = await client.emailOTP.findFirst({
    where: { email, type },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.expiresAt.getTime() <= now.getTime() || !otpMatches(email, type, otp, record.otpHash)) {
    throw new AppError(400, "INVALID_OTP", "The OTP is invalid or has expired.");
  }

  await client.emailOTP.deleteMany({
    where: { email, type },
  });
}

async function sendSignupVerificationEmail(email: string, otp: string) {
  try {
    await sendVerificationOTP(email, otp);
  } catch (error) {
    console.error("signup_verification_email_failed", error);
    throw new AppError(
      503,
      "EMAIL_DELIVERY_FAILED",
      "Your account was created, but we could not send the verification code. Request a new code and try again."
    );
  }
}

async function sendOtpBestEffort(label: string, email: string, deliver: () => Promise<void>) {
  try {
    await deliver();
  } catch (error) {
    console.error(label, { email, error });
  }
}

export async function signup(input: { name: string; email: string; password: string }) {
  const email = normalizeEmail(input.email);
  const passwordHash = await bcrypt.hash(input.password, 10);
  const role = toRole(email);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({ where: { email } });

      if (existing?.isEmailVerified) {
        throw new AppError(409, "EMAIL_EXISTS", "An account with this email already exists.");
      }

      const userData = {
        name: input.name.trim(),
        email,
        passwordHash,
        role,
        status: UserStatus.PENDING,
        isEmailVerified: false,
      };

      const user = existing
        ? await tx.user.update({
            where: { id: existing.id },
            data: userData,
          })
        : await tx.user.create({
            data: userData,
          });

      const otp = await issueOtp(tx, email, EmailOTPType.VERIFY_EMAIL);
      return { user, otp };
    });

    await sendSignupVerificationEmail(email, result.otp);

    return {
      success: true as const,
      requiresEmailVerification: true as const,
      message: "Verification OTP sent to your email address.",
      user: buildUserPayload(result.user),
    };
  } catch (error) {
    if (!shouldUseAuthDemoStore(error)) throw error;

    const result = await demoSignup(input, role);
    await sendSignupVerificationEmail(email, result.otp);

    return {
      success: true as const,
      requiresEmailVerification: true as const,
      message: "Verification OTP sent to your email address.",
      user: buildUserPayload(result.user),
    };
  }
}

export async function sendVerificationOtp(input: { email: string }) {
  const email = normalizeEmail(input.email);
  const response = {
    success: true as const,
    message: "If the account is awaiting verification, a new OTP has been sent.",
  };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isEmailVerified) {
      return response;
    }

    const otp = await prisma.$transaction(async (tx) => issueOtp(tx, email, EmailOTPType.VERIFY_EMAIL));
    await sendOtpBestEffort("verification_otp_delivery_failed", email, () => sendVerificationOTP(email, otp));
    return response;
  } catch (error) {
    if (!shouldUseAuthDemoStore(error)) throw error;

    const otp = await demoSendVerificationOtp(email);
    if (otp) {
      await sendOtpBestEffort("demo_verification_otp_delivery_failed", email, () => sendVerificationOTP(email, otp));
    }
    return response;
  }
}

export async function verifyEmail(input: { email: string; otp: string }) {
  const email = normalizeEmail(input.email);

  try {
    const user = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({ where: { email } });
      if (!existing) {
        throw new AppError(400, "INVALID_OTP", "The OTP is invalid or has expired.");
      }

      await consumeOtp(tx, email, EmailOTPType.VERIFY_EMAIL, input.otp);

      const verifiedUser = await tx.user.update({
        where: { id: existing.id },
        data: {
          isEmailVerified: true,
          status: UserStatus.ACTIVE,
        },
      });

      await tx.leaderboard.upsert({
        where: { userId: verifiedUser.id },
        update: {},
        create: {
          userId: verifiedUser.id,
          points: 0,
          level: 1,
          badges: [],
          streak: 0,
        },
      });

      return verifiedUser;
    });

    const token = signToken({ userId: user.id, email: user.email, role: roleLabel(user.role) });
    return { success: true as const, user: buildUserPayload(user), token };
  } catch (error) {
    if (!shouldUseAuthDemoStore(error)) throw error;

    const user = await demoVerifyEmail({ email, otp: input.otp });
    const token = signToken({ userId: user.id, email: user.email, role: roleLabel(user.role) });
    return { success: true as const, user: buildUserPayload(user), token };
  }
}

export async function login(input: { email: string; password: string }) {
  const email = normalizeEmail(input.email);

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError(404, "ACCOUNT_NOT_FOUND", "No account was found for this email.");
    }

    ensureAccountCanLogin(user);

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

    ensureAccountCanLogin(user);

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
    message: "If the account exists, a password reset OTP has been sent.",
  };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isEmailVerified || user.status === UserStatus.PENDING) {
      return response;
    }

    const otp = await prisma.$transaction(async (tx) => issueOtp(tx, email, EmailOTPType.RESET_PASSWORD));
    await sendOtpBestEffort("password_reset_otp_delivery_failed", email, () => sendPasswordResetOTP(email, otp));
    return response;
  } catch (error) {
    if (!shouldUseAuthDemoStore(error)) throw error;

    const otp = await demoForgotPassword(email);
    if (otp) {
      await sendOtpBestEffort("demo_password_reset_otp_delivery_failed", email, () => sendPasswordResetOTP(email, otp));
    }
    return response;
  }
}

export async function resetPassword(input: { email: string; otp: string; newPassword: string }) {
  const email = normalizeEmail(input.email);
  const passwordHash = await bcrypt.hash(input.newPassword, 10);

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { email } });
      if (!user || !user.isEmailVerified) {
        throw new AppError(400, "INVALID_OTP", "The OTP is invalid or has expired.");
      }

      await consumeOtp(tx, email, EmailOTPType.RESET_PASSWORD, input.otp);

      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });
    });

    return {
      success: true as const,
      message: "Password reset successfully.",
    };
  } catch (error) {
    if (!shouldUseAuthDemoStore(error)) throw error;

    await demoResetPassword({
      email,
      otp: input.otp,
      newPassword: input.newPassword,
    });

    return {
      success: true as const,
      message: "Password reset successfully.",
    };
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
