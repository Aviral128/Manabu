import bcrypt from "bcryptjs";
import { Role, UserStatus } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { AppError } from "../utils/appError";
import { generateMagicToken } from "../utils/magicToken";

type DemoUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string | null;
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

type DemoEmailTokenRecord = {
  id: string;
  email: string;
  token: string;
  expiresAt: string;
  createdAt: string;
};

type DemoUserTokenRecord = {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
};

type AppRole = "admin" | "manager" | "learner";

type DemoActorContext = {
  userId: string;
  email: string;
  role: AppRole;
};

type AuthDemoStore = {
  users: DemoUser[];
  leaderboards: DemoLeaderboard[];
  magicLinkTokens: DemoEmailTokenRecord[];
  passwordResetTokens: DemoEmailTokenRecord[];
  emailVerificationTokens: DemoUserTokenRecord[];
};

const storePath = path.resolve(process.cwd(), ".local", "auth-demo-store.json");
const TOKEN_EXPIRY_MS = 10 * 60 * 1000;
const PRESET_ADMIN_EMAILS = ["sultaniyaaviral@gmail.com", "codemva2025@gmail.com"];

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isPresetAdminEmail(email: string) {
  return PRESET_ADMIN_EMAILS.includes(normalizeEmail(email));
}

function roleLabel(role: Role): AppRole {
  if (role === Role.ADMIN) return "admin";
  if (role === Role.MANAGER) return "manager";
  return "learner";
}

function roleFromInput(role: AppRole): Role {
  if (role === "admin") return Role.ADMIN;
  if (role === "manager") return Role.MANAGER;
  return Role.LEARNER;
}

function validateRoleChange(actor: DemoActorContext, target: DemoUser, input: { role?: AppRole }) {
  const reservedAdmin = isPresetAdminEmail(target.email);
  if (reservedAdmin && input.role && input.role !== "admin") {
    throw new AppError(403, "ROLE_PROTECTED", "Preset admin accounts must remain admins.");
  }

  if (actor.role === "manager") {
    if (roleLabel(target.role) !== "learner") {
      throw new AppError(403, "FORBIDDEN", "Managers can only manage learner accounts.");
    }
    if (input.role && input.role !== "learner") {
      throw new AppError(403, "FORBIDDEN", "Managers cannot assign manager or admin roles.");
    }
  }

  if (actor.role === "admin") {
    if (input.role === "admin" && !reservedAdmin) {
      throw new AppError(403, "ROLE_PROTECTED", "Only the preset admin emails can have the admin role.");
    }
  }
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

function getTokenExpiryIso() {
  return new Date(Date.now() + TOKEN_EXPIRY_MS).toISOString();
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
        email: "sultaniyaaviral@gmail.com",
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
    magicLinkTokens: [],
    passwordResetTokens: [],
    emailVerificationTokens: [],
  };
}

function upgradeStore(store: AuthDemoStore | Record<string, unknown>) {
  const users = Array.isArray(store.users) ? store.users : [];
  const leaderboards = Array.isArray(store.leaderboards) ? store.leaderboards : [];
  const magicLinkTokens = Array.isArray((store as { magicLinkTokens?: unknown[] }).magicLinkTokens)
    ? ((store as { magicLinkTokens?: unknown[] }).magicLinkTokens as DemoEmailTokenRecord[])
    : [];
  const passwordResetTokens = Array.isArray((store as { passwordResetTokens?: unknown[] }).passwordResetTokens)
    ? ((store as { passwordResetTokens?: unknown[] }).passwordResetTokens as DemoEmailTokenRecord[])
    : [];
  const emailVerificationTokens = Array.isArray((store as { emailVerificationTokens?: unknown[] }).emailVerificationTokens)
    ? ((store as { emailVerificationTokens?: unknown[] }).emailVerificationTokens as DemoUserTokenRecord[])
    : [];

  return {
    users: users.map((user) => ({
      id: String((user as DemoUser).id),
      name: String((user as DemoUser).name ?? ""),
      email: normalizeEmail(String((user as DemoUser).email ?? "")),
      passwordHash: typeof (user as DemoUser).passwordHash === "string" ? (user as DemoUser).passwordHash : null,
      role: isPresetAdminEmail(String((user as DemoUser).email ?? ""))
        ? Role.ADMIN
        : (user as DemoUser).role === Role.MANAGER
          ? Role.MANAGER
          : Role.LEARNER,
      status: (user as DemoUser).status ?? UserStatus.ACTIVE,
      isEmailVerified: (user as DemoUser).isEmailVerified ?? (user as DemoUser).status !== UserStatus.PENDING,
      avatarUrl: (user as DemoUser).avatarUrl ?? null,
      createdAt: String((user as DemoUser).createdAt ?? nowIso()),
      updatedAt: String((user as DemoUser).updatedAt ?? (user as DemoUser).createdAt ?? nowIso()),
    })),
    leaderboards: leaderboards as DemoLeaderboard[],
    magicLinkTokens,
    passwordResetTokens,
    emailVerificationTokens,
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

function ensureAccountNotSuspended(status: UserStatus) {
  if (status === UserStatus.SUSPENDED) {
    throw new AppError(403, "ACCOUNT_SUSPENDED", "This account is suspended. Contact an administrator.");
  }
}

function ensureAccountVerified(user: Pick<DemoUser, "status" | "isEmailVerified">) {
  if (user.status === UserStatus.PENDING || !user.isEmailVerified) {
    throw new AppError(403, "EMAIL_NOT_VERIFIED", "Verify your email before logging in.");
  }
}

function addEmailTokenRecord(records: DemoEmailTokenRecord[], email: string) {
  const token = generateMagicToken();
  const next = records.filter((record) => record.email !== email);
  next.push({
    id: makeId("tok"),
    email,
    token,
    expiresAt: getTokenExpiryIso(),
    createdAt: nowIso(),
  });
  records.splice(0, records.length, ...next);
  return token;
}

function addUserTokenRecord(records: DemoUserTokenRecord[], userId: string) {
  const token = generateMagicToken();
  const next = records.filter((record) => record.userId !== userId);
  next.push({
    id: makeId("tok"),
    userId,
    token,
    expiresAt: getTokenExpiryIso(),
    createdAt: nowIso(),
  });
  records.splice(0, records.length, ...next);
  return token;
}

function consumeEmailToken(records: DemoEmailTokenRecord[], token: string, invalidCode: string, invalidMessage: string) {
  const record = records.find((item) => item.token === token);
  if (!record || new Date(record.expiresAt).getTime() <= Date.now()) {
    if (record) {
      const index = records.findIndex((item) => item.id === record.id);
      if (index >= 0) records.splice(index, 1);
    }
    throw new AppError(400, invalidCode, invalidMessage);
  }

  const index = records.findIndex((item) => item.id === record.id);
  if (index >= 0) records.splice(index, 1);
  return record.email;
}

function consumeUserToken(records: DemoUserTokenRecord[], token: string, invalidCode: string, invalidMessage: string) {
  const record = records.find((item) => item.token === token);
  if (!record || new Date(record.expiresAt).getTime() <= Date.now()) {
    if (record) {
      const index = records.findIndex((item) => item.id === record.id);
      if (index >= 0) records.splice(index, 1);
    }
    throw new AppError(400, invalidCode, invalidMessage);
  }

  const index = records.findIndex((item) => item.id === record.id);
  if (index >= 0) records.splice(index, 1);
  return record.userId;
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

  let verificationToken = "";
  let requiresVerification = true;

  await updateStore((store) => {
    const existing = store.users.find((user) => user.email === email);

    if (isPresetAdminEmail(email)) {
      requiresVerification = false;

      if (existing) {
        ensureAccountNotSuspended(existing.status);
        existing.name = input.name.trim() || deriveDisplayName(email);
        existing.passwordHash = passwordHash;
        existing.role = Role.ADMIN;
        existing.status = UserStatus.ACTIVE;
        existing.isEmailVerified = true;
        existing.updatedAt = nowIso();
        ensureLeaderboard(store, existing.id);
        store.emailVerificationTokens = store.emailVerificationTokens.filter((token) => token.userId !== existing.id);
        store.magicLinkTokens = store.magicLinkTokens.filter((token) => token.email !== email);
        return;
      }

      const timestamp = nowIso();
      const user: DemoUser = {
        id: makeId("usr"),
        name: input.name.trim() || deriveDisplayName(email),
        email,
        passwordHash,
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        avatarUrl: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      store.users.push(user);
      ensureLeaderboard(store, user.id);
      return;
    }

    if (existing) {
      ensureAccountNotSuspended(existing.status);

      if (existing.isEmailVerified) {
        throw new AppError(409, "EMAIL_EXISTS", "An account with this email already exists.");
      }

      existing.name = input.name.trim();
      existing.passwordHash = passwordHash;
      existing.role = role;
      existing.status = UserStatus.PENDING;
      existing.isEmailVerified = false;
      existing.updatedAt = nowIso();
      ensureLeaderboard(store, existing.id);
      verificationToken = addUserTokenRecord(store.emailVerificationTokens, existing.id);
      store.magicLinkTokens = store.magicLinkTokens.filter((token) => token.email !== email);
      return;
    }

    const timestamp = nowIso();
    const user: DemoUser = {
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

    store.users.push(user);
    ensureLeaderboard(store, user.id);
    verificationToken = addUserTokenRecord(store.emailVerificationTokens, user.id);
  });

  return { verificationToken: requiresVerification ? verificationToken : undefined, requiresVerification };
}

export async function demoVerifyEmail(token: string) {
  let resultUser: DemoUser | null = null;

  await updateStore((store) => {
    const userId = consumeUserToken(
      store.emailVerificationTokens,
      token,
      "INVALID_VERIFICATION_LINK",
      "This verification link is invalid or has expired."
    );

    const user = store.users.find((item) => item.id === userId);
    if (!user) {
      throw new AppError(400, "INVALID_VERIFICATION_LINK", "This verification link is invalid or has expired.");
    }

    ensureAccountNotSuspended(user.status);
    user.status = UserStatus.ACTIVE;
    user.isEmailVerified = true;
    user.name = user.name || deriveDisplayName(user.email);
    user.updatedAt = nowIso();
    ensureLeaderboard(store, user.id);
    store.emailVerificationTokens = store.emailVerificationTokens.filter((item) => item.userId !== user.id);
    resultUser = user;
  });

  return resultUser!;
}

export async function demoRequestMagicLogin(email: string) {
  const normalizedEmail = normalizeEmail(email);
  let token: string | null = null;

  await updateStore((store) => {
    let user = store.users.find((item) => item.email === normalizedEmail);

    if (isPresetAdminEmail(normalizedEmail)) {
      if (!user) {
        const timestamp = nowIso();
        user = {
          id: makeId("usr"),
          name: deriveDisplayName(normalizedEmail),
          email: normalizedEmail,
          passwordHash: null,
          role: Role.ADMIN,
          status: UserStatus.ACTIVE,
          isEmailVerified: true,
          avatarUrl: null,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        store.users.push(user);
      } else if (user && user.status !== UserStatus.SUSPENDED) {
        user.role = Role.ADMIN;
        user.status = UserStatus.ACTIVE;
        user.isEmailVerified = true;
        user.name = user.name || deriveDisplayName(normalizedEmail);
        user.updatedAt = nowIso();
      }

      if (user && user.status !== UserStatus.SUSPENDED) {
        const userId = user.id;
        ensureLeaderboard(store, userId);
        store.emailVerificationTokens = store.emailVerificationTokens.filter((record) => record.userId !== userId);
      }
    }

    if (!user || user.status === UserStatus.SUSPENDED || !user.isEmailVerified || user.status !== UserStatus.ACTIVE) {
      return;
    }

    token = addEmailTokenRecord(store.magicLinkTokens, normalizedEmail);
  });

  return token;
}

export async function demoVerifyMagicLogin(token: string) {
  let resultUser: DemoUser | null = null;

  await updateStore((store) => {
    const email = consumeEmailToken(
      store.magicLinkTokens,
      token,
      "INVALID_MAGIC_LINK",
      "This login link is invalid or has expired."
    );

    const user = store.users.find((item) => item.email === email);
    if (!user) {
      throw new AppError(400, "INVALID_MAGIC_LINK", "This login link is invalid or has expired.");
    }

    ensureAccountNotSuspended(user.status);
    ensureAccountVerified(user);
    ensureLeaderboard(store, user.id);
    resultUser = user;
  });

  return resultUser!;
}

export async function demoFindUserByEmail(email: string) {
  const store = await ensureStore();
  return store.users.find((user) => user.email === normalizeEmail(email)) ?? null;
}

export async function demoForgotPassword(email: string) {
  const normalizedEmail = normalizeEmail(email);
  let token: string | null = null;

  await updateStore((store) => {
    const user = store.users.find((item) => item.email === normalizedEmail);
    if (!user || user.status === UserStatus.SUSPENDED) return;
    token = addEmailTokenRecord(store.passwordResetTokens, normalizedEmail);
  });

  return token;
}

export async function demoResetPassword(input: { token: string; newPassword: string }) {
  await updateStore((store) => {
    const email = consumeEmailToken(
      store.passwordResetTokens,
      input.token,
      "INVALID_RESET_LINK",
      "This password reset link is invalid or has expired."
    );
    const user = store.users.find((item) => item.email === email);
    if (!user) {
      throw new AppError(400, "INVALID_RESET_LINK", "This password reset link is invalid or has expired.");
    }

    ensureAccountNotSuspended(user.status);
    user.passwordHash = bcrypt.hashSync(input.newPassword, 10);
    user.updatedAt = nowIso();
    ensureLeaderboard(store, user.id);
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
    quizStats: {
      totalQuizzesTaken: 0,
      averageAccuracy: 0,
      bestScore: 0,
    },
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
  input: { displayName?: string; role?: AppRole; status?: "pending" | "active" | "suspended"; avatarUrl?: string | null },
  actor: DemoActorContext
) {
  let updatedUser: DemoUser | null = null;
  await updateStore((store) => {
    const user = store.users.find((item) => item.id === userId);
    if (!user) {
      throw new AppError(404, "PROFILE_NOT_FOUND", "User profile not found.");
    }

    validateRoleChange(actor, user, input);

    if (typeof input.displayName === "string") user.name = input.displayName.trim();
    if (input.role) user.role = roleFromInput(input.role);
    if (input.status) {
      user.status =
        input.status === "suspended" ? UserStatus.SUSPENDED : input.status === "pending" ? UserStatus.PENDING : UserStatus.ACTIVE;
      if (input.status === "pending") user.isEmailVerified = false;
      if (input.status === "active") user.isEmailVerified = true;
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
      store.magicLinkTokens = store.magicLinkTokens.filter((token) => token.email !== user.email);
      store.passwordResetTokens = store.passwordResetTokens.filter((token) => token.email !== user.email);
      store.emailVerificationTokens = store.emailVerificationTokens.filter((token) => token.userId !== user.id);
    }

    store.users = store.users.filter((user) => user.id !== userId);
    store.leaderboards = store.leaderboards.filter((leaderboard) => leaderboard.userId !== userId);
  });
  return { success: true as const };
}
