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
  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const email = String(body.email ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "Please enter a valid email address." }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${getBackendApiBaseUrl()}/api/auth/magic-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        code: "AUTH_SERVICE_UNAVAILABLE",
        message: "The login link service is temporarily unavailable. Please try again.",
      },
      { status: 503 }
    );
  }

  const raw = await upstream.text();
  const payload = safeParse(raw) as { code?: string; message?: string; success?: boolean };

  if (!upstream.ok) {
    return NextResponse.json(
      { code: payload.code ?? "AUTH_MAGIC_LINK_FAILED", message: payload.message ?? "Unable to send the login link." },
      { status: upstream.status || 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: payload.message ?? "Check your inbox for a login link.",
  });
}
