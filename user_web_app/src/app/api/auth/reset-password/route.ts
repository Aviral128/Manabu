import { NextResponse } from "next/server";

import { getBackendApiBaseUrl } from "../../../../auth/server";

function safeParse(raw: string) {
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { token?: string; newPassword?: string };
  const token = String(body.token ?? "").trim();
  const newPassword = String(body.newPassword ?? "");

  if (!token || newPassword.length < 8) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "A valid reset token and a password of at least 8 characters are required." },
      { status: 400 }
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${getBackendApiBaseUrl()}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        code: "AUTH_SERVICE_UNAVAILABLE",
        message: "The password reset service is temporarily unavailable. Please try again.",
      },
      { status: 503 }
    );
  }

  const raw = await upstream.text();
  const payload = safeParse(raw) as { code?: string; message?: string };

  if (!upstream.ok) {
    return NextResponse.json(
      { code: payload.code ?? "AUTH_RESET_PASSWORD_FAILED", message: payload.message ?? "Unable to reset the password." },
      { status: upstream.status || 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: payload.message ?? "Password reset successfully.",
  });
}
