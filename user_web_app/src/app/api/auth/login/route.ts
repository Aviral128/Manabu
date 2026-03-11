import { NextResponse } from "next/server";

import { buildSessionUser, getBackendApiBaseUrl, setSessionCookies } from "../../../../auth/server";
import type { AuthMutationResponse, AuthUser } from "../../../../auth/shared";

type LoginBody = {
  email?: string;
  password?: string;
};

type BackendAuthResponse = {
  success: true;
  token: string;
  user: AuthUser;
};

function safeParse(raw: string) {
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginBody;
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !email.includes("@") || password.length < 8) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "Please enter a valid email and password." }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${getBackendApiBaseUrl()}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        code: "AUTH_SERVICE_UNAVAILABLE",
        message: "The login service is temporarily unavailable. Please make sure the backend is running and try again.",
      },
      { status: 503 }
    );
  }

  const raw = await upstream.text();
  const payload = safeParse(raw) as Partial<BackendAuthResponse> & { code?: string; message?: string };

  if (!upstream.ok || !payload.user || !payload.token) {
    return NextResponse.json(
      { code: payload.code ?? "AUTH_LOGIN_FAILED", message: payload.message ?? "Login failed." },
      { status: upstream.status || 500 }
    );
  }

  const user = buildSessionUser(payload.user);
  const secure = new URL(request.url).protocol === "https:";
  const response = NextResponse.json({
    success: true,
    user,
    token: payload.token,
  } satisfies AuthMutationResponse);

  setSessionCookies(response, user, payload.token, undefined, 60 * 60 * 24, secure);
  return response;
}
