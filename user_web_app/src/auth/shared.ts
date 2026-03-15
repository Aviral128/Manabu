export type UserRole = "admin" | "manager" | "learner";

export type AuthUser = {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  status?: "active" | "suspended";
  avatarUrl?: string;
};

export type AuthMutationResponse = {
  success: true;
  user: AuthUser;
  token: string;
  refreshToken?: string;
  expiresInSeconds?: number;
};

export type AuthMessageResponse = {
  success: true;
  message: string;
  requiresVerification?: boolean;
};

export const AUTH_COOKIES = {
  accessToken: "manabu_access_token",
  refreshToken: "manabu_refresh_token",
  user: "manabu_user",
  role: "manabu_role",
  authenticated: "manabu_authenticated",
} as const;

export function deriveDisplayName(email: string): string {
  const local = email.split("@")[0] ?? "learner";
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase()) || "Learner";
}

export function sanitizeUserId(value: string): string {
  const cleaned = value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return cleaned ? `usr_${cleaned}` : "usr_001";
}

export function serializeUserCookie(user: AuthUser): string {
  return encodeURIComponent(JSON.stringify(user));
}

export function parseUserCookie(value?: string | null): AuthUser | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<AuthUser>;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.userId !== "string" || typeof parsed.email !== "string" || typeof parsed.displayName !== "string") {
      return null;
    }

    const role: UserRole = parsed.role === "admin" ? "admin" : parsed.role === "manager" ? "manager" : "learner";
    return {
      userId: parsed.userId,
      email: parsed.email,
      displayName: parsed.displayName,
      role,
      status: parsed.status === "suspended" ? "suspended" : "active",
      avatarUrl: typeof parsed.avatarUrl === "string" ? parsed.avatarUrl : undefined,
    };
  } catch {
    return null;
  }
}

export function normalizeNextTarget(target: string | null | undefined, fallback: string): string {
  if (!target) return fallback;

  try {
    const base = typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:3000";
    const parsed = new URL(target, base);
    const current = new URL(base);
    const sameHostname = parsed.hostname === current.hostname;
    const allowedProtocol = parsed.protocol === "http:" || parsed.protocol === "https:";
    if (!sameHostname || !allowedProtocol) {
      return fallback;
    }

    return parsed.origin === current.origin ? `${parsed.pathname}${parsed.search}${parsed.hash}` : parsed.toString();
  } catch {
    return fallback;
  }
}
