import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { buildSessionUser, clearSessionCookies, getAccessToken, getBackendApiBaseUrl, readSessionUser, setSessionCookies } from "../../../../auth/server";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const accessToken = getAccessToken(cookieStore);
  const cachedUser = readSessionUser(cookieStore);
  const hadAuthenticatedCookie = cookieStore.get("manabu_authenticated")?.value === "1";

  if (!accessToken) {
    const response = NextResponse.json({ authenticated: false, user: null });
    if (cachedUser || hadAuthenticatedCookie) {
      clearSessionCookies(response, new URL(request.url).protocol === "https:");
    }
    return response;
  }

  let upstream: Response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8_000);
  try {
    upstream = await fetch(`${getBackendApiBaseUrl()}/api/auth/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
      signal: controller.signal,
    });
  } catch {
    return NextResponse.json({
      authenticated: Boolean(cachedUser),
      user: cachedUser,
      role: cachedUser?.role,
      degraded: true,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!upstream.ok) {
    const response = NextResponse.json({ authenticated: false, user: null });
    clearSessionCookies(response, new URL(request.url).protocol === "https:");
    return response;
  }

  const payload = (await upstream.json()) as {
    userId: string;
    displayName: string;
    email: string;
    role: "admin" | "manager" | "learner";
    status?: "active" | "suspended";
    avatarUrl?: string;
  };

  const user = buildSessionUser(payload);
  const response = NextResponse.json({
    authenticated: true,
    user,
    role: user.role,
    profile: payload,
    cachedUser,
  });

  setSessionCookies(response, user, accessToken, undefined, 60 * 60 * 24, new URL(request.url).protocol === "https:");
  return response;
}
