import { NextResponse } from "next/server";

import { getBackendApiBaseUrl } from "../../../../auth/server";
import type { AuthMessageResponse } from "../../../../auth/shared";

function safeParse(raw: string) {
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim() ?? "";

  if (!token) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "A verification token is required." }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${getBackendApiBaseUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: "GET",
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        code: "AUTH_SERVICE_UNAVAILABLE",
        message: "The email verification service is temporarily unavailable. Please try again.",
      },
      { status: 503 }
    );
  }

  const raw = await upstream.text();
  const payload = safeParse(raw) as Partial<AuthMessageResponse> & { code?: string; message?: string };

  if (!upstream.ok || payload.success !== true || typeof payload.message !== "string") {
    return NextResponse.json(
      { code: payload.code ?? "AUTH_VERIFY_EMAIL_FAILED", message: payload.message ?? "Email verification failed." },
      { status: upstream.status || 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: payload.message,
  } satisfies AuthMessageResponse);
}
