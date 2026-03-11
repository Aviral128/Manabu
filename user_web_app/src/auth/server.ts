import type { NextResponse } from "next/server";
import { API_BASE_URL } from "../config/api";

import {
  AUTH_COOKIES,
  deriveDisplayName,
  parseUserCookie,
  sanitizeUserId,
  serializeUserCookie,
  type AuthUser,
  type UserRole,
} from "./shared";

type CookieReader = {
  get(name: string): { value: string } | undefined;
};

const DEFAULT_ADMIN_EMAILS = ["admin@manabu.app", "aviral@manabu.app", "aviral.sultaniya@manabu.app"];

function parseAdminEmails(): string[] {
  const raw = process.env.MANABU_ADMIN_EMAILS ?? process.env.NEXT_PUBLIC_MANABU_ADMIN_EMAILS;
  if (!raw) return DEFAULT_ADMIN_EMAILS;
  return raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function cookieOptions(maxAge: number, httpOnly: boolean, secure: boolean) {
  return {
    httpOnly,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge,
  };
}

export function getBackendApiBaseUrl(): string {
  return API_BASE_URL;
}

export function resolveUserRole(email: string): UserRole {
  const normalized = email.trim().toLowerCase();
  const admins = parseAdminEmails();
  if (admins.includes(normalized) || normalized.includes("admin") || normalized.includes("aviral")) {
    return "admin";
  }
  return "learner";
}

export function buildSessionUser({
  email,
  displayName,
  userId,
  role,
  status,
  avatarUrl,
}: {
  email: string;
  displayName?: string;
  userId?: string;
  role?: UserRole;
  status?: "active" | "suspended";
  avatarUrl?: string;
}): AuthUser {
  const normalizedEmail = email.trim().toLowerCase();
  return {
    userId: sanitizeUserId(userId ?? normalizedEmail.split("@")[0] ?? "001"),
    email: normalizedEmail,
    displayName: displayName?.trim() || deriveDisplayName(normalizedEmail),
    role: role ?? resolveUserRole(normalizedEmail),
    status: status ?? "active",
    avatarUrl,
  };
}

export function setSessionCookies(
  response: NextResponse,
  user: AuthUser,
  accessToken: string,
  refreshToken?: string,
  expiresInSeconds = 60 * 60,
  secure = false
) {
  const maxAge = Math.max(expiresInSeconds, 60 * 60 * 24);

  response.cookies.set(AUTH_COOKIES.accessToken, accessToken, cookieOptions(maxAge, true, secure));
  if (refreshToken) {
    response.cookies.set(AUTH_COOKIES.refreshToken, refreshToken, cookieOptions(maxAge * 2, true, secure));
  }

  response.cookies.set(AUTH_COOKIES.user, serializeUserCookie(user), cookieOptions(maxAge, false, secure));
  response.cookies.set(AUTH_COOKIES.role, user.role, cookieOptions(maxAge, false, secure));
  response.cookies.set(AUTH_COOKIES.authenticated, "1", cookieOptions(maxAge, false, secure));
}

export function clearSessionCookies(response: NextResponse, secure = false) {
  for (const key of Object.values(AUTH_COOKIES)) {
    response.cookies.set(key, "", {
      path: "/",
      maxAge: 0,
      secure,
      sameSite: "lax",
      httpOnly: key === AUTH_COOKIES.accessToken || key === AUTH_COOKIES.refreshToken,
    });
  }
}

export function readSessionUser(cookieStore: CookieReader): AuthUser | null {
  return parseUserCookie(cookieStore.get(AUTH_COOKIES.user)?.value);
}

export function getAccessToken(cookieStore: CookieReader): string | null {
  return cookieStore.get(AUTH_COOKIES.accessToken)?.value ?? null;
}

export function isAuthenticated(cookieStore: CookieReader): boolean {
  return cookieStore.get(AUTH_COOKIES.authenticated)?.value === "1" && Boolean(readSessionUser(cookieStore));
}

export function isAdmin(cookieStore: CookieReader): boolean {
  const role = cookieStore.get(AUTH_COOKIES.role)?.value;
  if (role === "admin") return true;
  return readSessionUser(cookieStore)?.role === "admin";
}
