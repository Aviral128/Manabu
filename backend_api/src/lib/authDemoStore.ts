import bcrypt from "bcryptjs";
import { Role, UserStatus } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { AppError } from "../utils/appError";

type DemoUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  status: UserStatus;
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

type AuthDemoStore = {
  users: DemoUser[];
  leaderboards: DemoLeaderboard[];
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
        avatarUrl: null,
        createdAt,
        updatedAt: createdAt,
      },
    ],
    leaderboards: [
      { id: makeId("lb"), userId: "usr_learner", points: 40, level: 1, badges: ["Starter"], streak: 2, updatedAt: createdAt },
      { id: makeId("lb"), userId: "usr_admin", points: 120, level: 1, badges: ["Builder"], streak: 4, updatedAt: createdAt },
    ],
  };
}

async function ensureStore(): Promise<AuthDemoStore> {
  if (!fs.existsSync(storePath)) {
    const seeded = await seedStore();
    fs.mkdirSync(path.dirname(storePath), { recursive: true });
    fs.writeFileSync(storePath, JSON.stringify(seeded, null, 2), "utf-8");
    return seeded;
  }

  return JSON.parse(fs.readFileSync(storePath, "utf-8")) as AuthDemoStore;
}

async function updateStore(mutator: (store: AuthDemoStore) => void): Promise<AuthDemoStore> {
  const store = await ensureStore();
  mutator(store);
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf-8");
  return store;
}

function getLeaderboard(store: AuthDemoStore, userId: string) {
  let leaderboard = store.leaderboards.find((row) => row.userId === userId);
  if (!leaderboard) {
    leaderboard = { id: makeId("lb"), userId, points: 0, level: 1, badges: [], streak: 0, updatedAt: nowIso() };
    store.leaderboards.push(leaderboard);
  }
  return leaderboard;
}

export function shouldUseAuthDemoStore(error: unknown): boolean {
  if (String(process.env.MANABU_STORAGE ?? "").toLowerCase() === "demo") {
    return true;
  }

  const message = error instanceof Error ? error.message : String(error ?? "");
  return /Can't reach database server|P1001|database server|ECONNREFUSED/i.test(message);
}

export async function demoSignup(input: { name: string; email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const store = await ensureStore();
  if (store.users.some((user) => user.email === email)) {
    throw new AppError(409, "EMAIL_EXISTS", "An account with this email already exists.");
  }

  const createdAt = nowIso();
  const user: DemoUser = {
    id: makeId("usr"),
    name: input.name.trim(),
    email,
    passwordHash: await bcrypt.hash(input.password, 10),
    role: email.includes("admin") || email.includes("aviral") ? Role.ADMIN : Role.LEARNER,
    status: UserStatus.ACTIVE,
    avatarUrl: null,
    createdAt,
    updatedAt: createdAt,
  };

  await updateStore((next) => {
    next.users.push(user);
    next.leaderboards.push({ id: makeId("lb"), userId: user.id, points: 0, level: 1, badges: [], streak: 0, updatedAt: createdAt });
  });

  return user;
}

export async function demoFindUserByEmail(email: string) {
  const store = await ensureStore();
  return store.users.find((user) => user.email === email.trim().toLowerCase()) ?? null;
}

export async function demoGetProfile(userId: string) {
  const store = await ensureStore();
  const user = store.users.find((item) => item.id === userId);
  if (!user) {
    throw new AppError(404, "PROFILE_NOT_FOUND", "User profile not found.");
  }

  const leaderboard = getLeaderboard(store, userId);
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
    const leaderboard = getLeaderboard(store, user.id);
    return { user, leaderboard, attempts: 0 };
  });
}

export async function demoUpdateUser(
  userId: string,
  input: { displayName?: string; role?: "admin" | "learner"; status?: "active" | "suspended"; avatarUrl?: string | null }
) {
  let updatedUser: DemoUser | null = null;
  await updateStore((store) => {
    const user = store.users.find((item) => item.id === userId);
    if (!user) {
      throw new AppError(404, "PROFILE_NOT_FOUND", "User profile not found.");
    }

    if (typeof input.displayName === "string") user.name = input.displayName.trim();
    if (input.role) user.role = input.role === "admin" ? Role.ADMIN : Role.LEARNER;
    if (input.status) user.status = input.status === "suspended" ? UserStatus.SUSPENDED : UserStatus.ACTIVE;
    if ("avatarUrl" in input) user.avatarUrl = input.avatarUrl?.trim() || null;
    user.updatedAt = nowIso();
    updatedUser = user;
  });

  return updatedUser!;
}

export async function demoDeleteUser(userId: string) {
  await updateStore((store) => {
    store.users = store.users.filter((user) => user.id !== userId);
    store.leaderboards = store.leaderboards.filter((leaderboard) => leaderboard.userId !== userId);
  });
  return { success: true as const };
}
