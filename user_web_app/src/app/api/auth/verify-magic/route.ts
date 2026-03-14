import { NextResponse } from "next/server";

import { buildSessionUser, getBackendApiBaseUrl, setSessionCookies } from "../../../../auth/server";
import type { AuthMutationResponse, AuthUser } from "../../../../auth/shared";

function safeParse(raw: string) {
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

type BackendAuthResponse = {
  success: true;
  token: string;
  user: AuthUser;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim() ?? "";

  if (!token) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "A login token is required." }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${getBackendApiBaseUrl()}/api/auth/verify-magic?token=${encodeURIComponent(token)}`, {
      method: "GET",
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        code: "AUTH_SERVICE_UNAVAILABLE",
        message: "The magic-link verification service is temporarily unavailable. Please try again.",
      },
      { status: 503 }
    );
  }

  const raw = await upstream.text();
  const payload = safeParse(raw) as Partial<BackendAuthResponse> & { code?: string; message?: string };

  if (!upstream.ok || !payload.user || !payload.token) {
    return NextResponse.json(
      { code: payload.code ?? "AUTH_VERIFY_MAGIC_FAILED", message: payload.message ?? "Magic-link verification failed." },
      { status: upstream.status || 500 }
    );
  }

  const user = buildSessionUser(payload.user);
  const secure = url.protocol === "https:";
  const response = NextResponse.json({
    success: true,
    user,
    token: payload.token,
  } satisfies AuthMutationResponse);

  setSessionCookies(response, user, payload.token, undefined, 60 * 60 * 24, secure);
  return response;
}
