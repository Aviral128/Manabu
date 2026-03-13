import bcrypt from "bcryptjs";
import { EmailOTPType, Role, UserStatus } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { AppError } from "../utils/appError";
import { generateOtpCode, getOtpExpiryDate, hashOtpCode, normalizeEmail, otpMatches } from "../utils/otp";

type DemoUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  status: UserStatus;
  isEmailVerified: boolean;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type DemoLeaderboard = {
  id: string;
  userId: string;
  points: number;
  level: number;
  badges: string[];
  streak: number;
  updatedAt: string;
};

type DemoEmailOTP = {
  id: string;
  email: string;
  otpHash: string;
  type: EmailOTPType;
  expiresAt: string;
  createdAt: string;
};

type AuthDemoStore = {
  users: DemoUser[];
  leaderboards: DemoLeaderboard[];
  emailOtps: DemoEmailOTP[];
};

const storePath = path.resolve(process.cwd(), ".local", "auth-demo-store.json");

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

async function seedStore(): Promise<AuthDemoStore> {
  const createdAt = nowIso();
  return {
    users: [
      {
        id: "usr_learner",
        name: "Learner",
        email: "learner@manabu.app",
        passwordHash: await bcrypt.hash("StrongPass123", 10),
        role: Role.LEARNER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        avatarUrl: null,
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "usr_admin",
        name: "Aviral Sultaniya",
        email: "aviral@manabu.app",
        passwordHash: await bcrypt.hash("StrongPass123", 10),
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        avatarUrl: null,
        createdAt,
        updatedAt: createdAt,
      },
    ],
    leaderboards: [
      { id: makeId("lb"), userId: "usr_learner", points: 40, level: 1, badges: ["Starter"], streak: 2, updatedAt: createdAt },
      { id: makeId("lb"), userId: "usr_admin", points: 120, level: 1, badges: ["Builder"], streak: 4, updatedAt: createdAt },
    ],
    emailOtps: [],
  };
}

function upgradeStore(store: AuthDemoStore | Record<string, unknown>) {
  const users = Array.isArray(store.users) ? store.users : [];
  const leaderboards = Array.isArray(store.leaderboards) ? store.leaderboards : [];
  const emailOtps = Array.isArray(store.emailOtps) ? store.emailOtps : [];

  return {
    users: users.map((user) => ({
      id: String((user as DemoUser).id),
      name: String((user as DemoUser).name ?? ""),
      email: normalizeEmail(String((user as DemoUser).email ?? "")),
      passwordHash: String((user as DemoUser).passwordHash ?? ""),
      role: (user as DemoUser).role ?? Role.LEARNER,
      status: (user as DemoUser).status ?? UserStatus.ACTIVE,
      isEmailVerified: (user as DemoUser).isEmailVerified ?? (user as DemoUser).status !== UserStatus.PENDING,
      avatarUrl: (user as DemoUser).avatarUrl ?? null,
      createdAt: String((user as DemoUser).createdAt ?? nowIso()),
      updatedAt: String((user as DemoUser).updatedAt ?? (user as DemoUser).createdAt ?? nowIso()),
    })),
    leaderboards: leaderboards as DemoLeaderboard[],
    emailOtps: emailOtps as DemoEmailOTP[],
  } satisfies AuthDemoStore;
}

async function ensureStore(): Promise<AuthDemoStore> {
  if (!fs.existsSync(storePath)) {
    const seeded = await seedStore();
    fs.mkdirSync(path.dirname(storePath), { recursive: true });
    fs.writeFileSync(storePath, JSON.stringify(seeded, null, 2), "utf-8");
    return seeded;
  }

  return upgradeStore(JSON.parse(fs.readFileSync(storePath, "utf-8")) as AuthDemoStore);
}

async function updateStore(mutator: (store: AuthDemoStore) => void): Promise<AuthDemoStore> {
  const store = await ensureStore();
  mutator(store);
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf-8");
  return store;
}

function ensureLeaderboard(store: AuthDemoStore, userId: string) {
  let leaderboard = store.leaderboards.find((row) => row.userId === userId);
  if (!leaderboard) {
    leaderboard = { id: makeId("lb"), userId, points: 0, level: 1, badges: [], streak: 0, updatedAt: nowIso() };
    store.leaderboards.push(leaderboard);
  }
  return leaderboard;
}

function createOtpRecord(store: AuthDemoStore, email: string, type: EmailOTPType) {
  const otp = generateOtpCode();
  store.emailOtps = store.emailOtps.filter((record) => !(record.email === email && record.type === type));
  store.emailOtps.push({
    id: makeId("otp"),
    email,
    otpHash: hashOtpCode(email, type, otp),
    type,
    expiresAt: getOtpExpiryDate().toISOString(),
    createdAt: nowIso(),
  });
  return otp;
}

function consumeOtp(store: AuthDemoStore, email: string, type: EmailOTPType, otp: string) {
  const now = Date.now();
  store.emailOtps = store.emailOtps.filter((record) => new Date(record.expiresAt).getTime() > now);

  const record = [...store.emailOtps]
    .filter((item) => item.email === email && item.type === type)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0];

  if (!record || new Date(record.expiresAt).getTime() <= now || !otpMatches(email, type, otp, record.otpHash)) {
    throw new AppError(400, "INVALID_OTP", "The OTP is invalid or has expired.");
  }

  store.emailOtps = store.emailOtps.filter((item) => !(item.email === email && item.type === type));
}

export function shouldUseAuthDemoStore(error: unknown): boolean {
  if (String(process.env.MANABU_STORAGE ?? "").toLowerCase() === "demo") {
    return true;
  }

  const message = error instanceof Error ? error.message : String(error ?? "");
  return /Can't reach database server|P1001|P1012|database server|ECONNREFUSED|Error validating datasource `db`|the URL must start with the protocol/i.test(message);
}

export async function demoSignup(input: { name: string; email: string; password: string }, role: Role) {
  const email = normalizeEmail(input.email);
  const passwordHash = await bcrypt.hash(input.password, 10);

  let result: { user: DemoUser; otp: string } | null = null;

  await updateStore((store) => {
    const existing = store.users.find((user) => user.email === email);
    if (existing?.isEmailVerified) {
      throw new AppError(409, "EMAIL_EXISTS", "An account with this email already exists.");
    }

    const timestamp = nowIso();
    const user = existing
      ? Object.assign(existing, {
          name: input.name.trim(),
          passwordHash,
          role,
          status: UserStatus.PENDING,
          isEmailVerified: false,
          updatedAt: timestamp,
        })
      : {
          id: makeId("usr"),
          name: input.name.trim(),
          email,
          passwordHash,
          role,
          status: UserStatus.PENDING,
          isEmailVerified: false,
          avatarUrl: null,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

    if (!existing) {
      store.users.push(user);
    }

    result = {
      user,
      otp: createOtpRecord(store, email, EmailOTPType.VERIFY_EMAIL),
    };
  });

  return result!;
}

export async function demoSendVerificationOtp(email: string) {
  const normalizedEmail = normalizeEmail(email);
  let otp: string | null = null;

  await updateStore((store) => {
    const user = store.users.find((item) => item.email === normalizedEmail);
    if (!user || user.isEmailVerified) return;
    otp = createOtpRecord(store, normalizedEmail, EmailOTPType.VERIFY_EMAIL);
  });

  return otp;
}

export async function demoVerifyEmail(input: { email: string; otp: string }) {
  const email = normalizeEmail(input.email);
  let verifiedUser: DemoUser | null = null;

  await updateStore((store) => {
    const user = store.users.find((item) => item.email === email);
    if (!user) {
      throw new AppError(400, "INVALID_OTP", "The OTP is invalid or has expired.");
    }

    consumeOtp(store, email, EmailOTPType.VERIFY_EMAIL, input.otp);
    user.status = UserStatus.ACTIVE;
    user.isEmailVerified = true;
    user.updatedAt = nowIso();
    ensureLeaderboard(store, user.id);
    verifiedUser = user;
  });

  return verifiedUser!;
}

export async function demoFindUserByEmail(email: string) {
  const store = await ensureStore();
  return store.users.find((user) => user.email === normalizeEmail(email)) ?? null;
}

export async function demoForgotPassword(email: string) {
  const normalizedEmail = normalizeEmail(email);
  let otp: string | null = null;

  await updateStore((store) => {
    const user = store.users.find((item) => item.email === normalizedEmail);
    if (!user || !user.isEmailVerified || user.status === UserStatus.PENDING) return;
    otp = createOtpRecord(store, normalizedEmail, EmailOTPType.RESET_PASSWORD);
  });

  return otp;
}

export async function demoResetPassword(input: { email: string; otp: string; newPassword: string }) {
  const email = normalizeEmail(input.email);

  await updateStore((store) => {
    const user = store.users.find((item) => item.email === email);
    if (!user || !user.isEmailVerified) {
      throw new AppError(400, "INVALID_OTP", "The OTP is invalid or has expired.");
    }

    consumeOtp(store, email, EmailOTPType.RESET_PASSWORD, input.otp);
    user.passwordHash = bcrypt.hashSync(input.newPassword, 10);
    user.updatedAt = nowIso();
  });
}

export async function demoGetProfile(userId: string) {
  const store = await ensureStore();
  const user = store.users.find((item) => item.id === userId);
  if (!user) {
    throw new AppError(404, "PROFILE_NOT_FOUND", "User profile not found.");
  }

  const leaderboard = ensureLeaderboard(store, userId);
  return {
    user,
    leaderboard,
    recentAttempts: [] as Array<{
      attemptId: string;
      quizId: string;
      quizTitle: string;
      score: number;
      correctAnswers: number;
      totalQuestions: number;
      completedAt: string;
    }>,
  };
}

export async function demoUpdateProfile(userId: string, input: { displayName?: string; avatarUrl?: string | null }) {
  let updatedUser: DemoUser | null = null;
  await updateStore((store) => {
    const user = store.users.find((item) => item.id === userId);
    if (!user) {
      throw new AppError(404, "PROFILE_NOT_FOUND", "User profile not found.");
    }

    if (typeof input.displayName === "string") user.name = input.displayName.trim();
    if ("avatarUrl" in input) user.avatarUrl = input.avatarUrl?.trim() || null;
    user.updatedAt = nowIso();
    updatedUser = user;
  });

  return updatedUser!;
}

export async function demoListUsers() {
  const store = await ensureStore();
  return store.users.map((user) => {
    const leaderboard = ensureLeaderboard(store, user.id);
    return { user, leaderboard, attempts: 0 };
  });
}

export async function demoUpdateUser(
  userId: string,
  input: { displayName?: string; role?: "admin" | "learner"; status?: "pending" | "active" | "suspended"; avatarUrl?: string | null }
) {
  let updatedUser: DemoUser | null = null;
  await updateStore((store) => {
    const user = store.users.find((item) => item.id === userId);
    if (!user) {
      throw new AppError(404, "PROFILE_NOT_FOUND", "User profile not found.");
    }

    if (typeof input.displayName === "string") user.name = input.displayName.trim();
    if (input.role) user.role = input.role === "admin" ? Role.ADMIN : Role.LEARNER;
    if (input.status) {
      user.status =
        input.status === "suspended" ? UserStatus.SUSPENDED : input.status === "pending" ? UserStatus.PENDING : UserStatus.ACTIVE;
      user.isEmailVerified = user.status === UserStatus.PENDING ? false : user.isEmailVerified;
    }
    if ("avatarUrl" in input) user.avatarUrl = input.avatarUrl?.trim() || null;
    user.updatedAt = nowIso();
    updatedUser = user;
  });

  return updatedUser!;
}

export async function demoDeleteUser(userId: string) {
  await updateStore((store) => {
    const user = store.users.find((item) => item.id === userId);
    if (user) {
      store.emailOtps = store.emailOtps.filter((otp) => otp.email !== user.email);
    }
    store.users = store.users.filter((user) => user.id !== userId);
    store.leaderboards = store.leaderboards.filter((leaderboard) => leaderboard.userId !== userId);
  });
  return { success: true as const };
}
