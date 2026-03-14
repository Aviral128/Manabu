import { NextResponse } from "next/server";

import { getBackendApiBaseUrl } from "../../../../auth/server";
import type { AuthMessageResponse } from "../../../../auth/shared";

type SignupBody = {
  email?: string;
  password?: string;
  displayName?: string;
};

type BackendSignupResponse = AuthMessageResponse;

function safeParse(raw: string) {
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as SignupBody;
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const displayName = String(body.displayName ?? "").trim();

  if (!displayName || displayName.length < 2) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "Display name must be at least 2 characters long." }, { status: 400 });
  }

  if (!email || !email.includes("@") || password.length < 8) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "Please enter a valid email and password." }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${getBackendApiBaseUrl()}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: displayName, email, password }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        code: "AUTH_SERVICE_UNAVAILABLE",
        message: "The signup service is temporarily unavailable. Please make sure the backend is running and try again.",
      },
      { status: 503 }
    );
  }

  const raw = await upstream.text();
  const payload = safeParse(raw) as Partial<BackendSignupResponse> & { code?: string; message?: string };

  if (!upstream.ok || payload.success !== true || typeof payload.message !== "string") {
    return NextResponse.json(
      { code: payload.code ?? "AUTH_SIGNUP_FAILED", message: payload.message ?? "Signup failed." },
      { status: upstream.status || 500 }
    );
  }

  const response = NextResponse.json({
    success: true,
    message: payload.message,
    requiresVerification: payload.requiresVerification ?? true,
  } satisfies AuthMessageResponse);
  return response;
}
