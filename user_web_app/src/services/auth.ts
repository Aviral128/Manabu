import type { AuthMessageResponse, AuthMutationResponse, AuthUser } from "../auth/shared";

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = { email: string; password: string; displayName: string };
export type SessionResponse = { authenticated: boolean; user: AuthUser | null; role?: AuthUser["role"] };
export type MessageResponse = AuthMessageResponse;
export type ResetPasswordPayload = { token: string; newPassword: string };

function getFriendlyAuthMessage(payload: { code?: string; message?: string }, status: number) {
  switch (payload.code) {
    case "EMAIL_EXISTS":
      return "An account already exists for this email. Try logging in instead.";
    case "EMAIL_NOT_VERIFIED":
      return "Email not verified. Check your inbox for the verification link before logging in.";
    case "INVALID_PASSWORD":
      return "Incorrect password. Please try again.";
    case "PASSWORD_LOGIN_UNAVAILABLE":
      return "This account does not have a password yet. Use a magic link or reset your password.";
    case "ACCOUNT_NOT_FOUND":
      return "No account was found for this email.";
    case "ACCOUNT_SUSPENDED":
      return "This account is currently suspended. Please contact support or an administrator.";
    case "INVALID_MAGIC_LINK":
      return "This login link is invalid or has expired. Request a new one and try again.";
    case "INVALID_VERIFICATION_LINK":
      return "This verification link is invalid or has expired.";
    case "INVALID_RESET_LINK":
      return "This reset link is invalid or has expired.";
    case "AUTH_RATE_LIMITED":
    case "TOKEN_ATTEMPTS_LIMITED":
      return "Too many attempts were made from this session. Please wait a few minutes and try again.";
    case "AUTH_SERVICE_UNAVAILABLE":
      return "The authentication service is temporarily unavailable. Please try again in a moment.";
    default:
      if (status >= 500) return "The authentication service hit an unexpected problem. Please try again.";
      return payload.message ?? "Authentication request failed.";
  }
}

async function requestAuth<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12_000);
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("The authentication service is taking too long to respond. Please try again.");
    }
    throw new Error("The authentication service is not reachable right now. Please wait a few seconds and try again.");
  } finally {
    clearTimeout(timeoutId);
  }

  const raw = await response.text();
  let payload: unknown = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(getFriendlyAuthMessage(payload as any, response.status));
  }

  return payload as T;
}

export async function login(payload: LoginPayload): Promise<AuthMutationResponse> {
  return requestAuth<AuthMutationResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function signup(payload: RegisterPayload): Promise<MessageResponse> {
  return requestAuth<MessageResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export const register = signup;

export async function requestMagicLink(email: string): Promise<MessageResponse> {
  return requestAuth<MessageResponse>("/api/auth/magic-login", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyMagicLink(token: string): Promise<AuthMutationResponse> {
  return requestAuth<AuthMutationResponse>(`/api/auth/verify-magic?token=${encodeURIComponent(token)}`, {
    method: "GET",
  });
}

export async function verifyEmail(token: string): Promise<MessageResponse> {
  return requestAuth<MessageResponse>(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
    method: "GET",
  });
}

export async function requestPasswordReset(email: string): Promise<MessageResponse> {
  return requestAuth<MessageResponse>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<MessageResponse> {
  return requestAuth<MessageResponse>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchSession(): Promise<SessionResponse> {
  return requestAuth<SessionResponse>("/api/auth/session", {
    method: "GET",
  });
}

export async function logout(): Promise<void> {
  await requestAuth("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
}
