import type { AuthMessageResponse, AuthMutationResponse, AuthUser } from "../auth/shared";

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = { email: string; password: string; displayName: string };
export type SessionResponse = { authenticated: boolean; user: AuthUser | null; role?: AuthUser["role"] };
export type MessageResponse = AuthMessageResponse;
export type ResetPasswordPayload = { token: string; newPassword: string };

async function requestAuth<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch {
    throw new Error("The authentication service is not reachable right now. Please wait a few seconds and try again.");
  }

  const raw = await response.text();
  let payload: unknown = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new Error((payload as any)?.message ?? "Authentication request failed.");
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
