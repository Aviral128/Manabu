import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_COOKIES } from "./auth/shared";
import { API_BASE_URL } from "./config/api";

type AuthCheckResult =
  | { kind: "authenticated"; role: string | null }
  | { kind: "invalid" }
  | { kind: "unknown" };

function redirectToLogin(request: NextRequest, clearCookies = false) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  const response = NextResponse.redirect(loginUrl);

  if (clearCookies) {
    clearAuthCookies(response, request);
  }

  return response;
}

function clearAuthCookies(response: NextResponse, request: NextRequest) {
  for (const key of Object.values(AUTH_COOKIES)) {
    response.cookies.set(key, "", {
      path: "/",
      maxAge: 0,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      httpOnly: key === AUTH_COOKIES.accessToken || key === AUTH_COOKIES.refreshToken,
    });
  }
}

function forbiddenResponse() {
  return new NextResponse("Unauthorized", {
    status: 403,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

async function verifySession(accessToken: string): Promise<AuthCheckResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (response.status === 401 || response.status === 403) {
      return { kind: "invalid" };
    }

    if (!response.ok) {
      return { kind: "unknown" };
    }

    const payload = (await response.json().catch(() => ({}))) as { role?: string };
    return { kind: "authenticated", role: typeof payload.role === "string" ? payload.role : null };
  } catch {
    return { kind: "unknown" };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authPage = pathname === "/login" || pathname === "/signup";
  const protectedAlias = pathname === "/dashboard" || pathname === "/quiz";
  const protectedRoute = pathname.startsWith("/app") || pathname.startsWith("/dev") || pathname.startsWith("/admin") || protectedAlias;

  if (!protectedRoute && !authPage) {
    return NextResponse.next();
  }

  const authenticated = request.cookies.get(AUTH_COOKIES.authenticated)?.value === "1";
  const accessToken = request.cookies.get(AUTH_COOKIES.accessToken)?.value;
  const role = request.cookies.get(AUTH_COOKIES.role)?.value;
  const shouldValidate = authenticated && Boolean(accessToken);
  const authCheck = shouldValidate && accessToken ? await verifySession(accessToken) : null;
  const effectiveRole = authCheck?.kind === "authenticated" && authCheck.role ? authCheck.role : role;

  if (authPage) {
    if (!authenticated || !accessToken) {
      return NextResponse.next();
    }

    if (authCheck?.kind === "invalid") {
      const response = NextResponse.next();
      clearAuthCookies(response, request);
      return response;
    }

    return NextResponse.redirect(new URL("/app/dashboard", request.url));
  }

  if (pathname.startsWith("/admin")) {
    if (!authenticated || !accessToken) {
      return redirectToLogin(request);
    }
    if (authCheck?.kind === "invalid") {
      return redirectToLogin(request, true);
    }
    if (effectiveRole !== "admin") {
      return forbiddenResponse();
    }
    return NextResponse.next();
  }

  if (!authenticated || !accessToken) {
    return redirectToLogin(request);
  }

  if (authCheck?.kind === "invalid") {
    return redirectToLogin(request, true);
  }

  if (pathname.startsWith("/dev") && effectiveRole !== "admin") {
    return NextResponse.redirect(new URL("/app/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/dev/:path*", "/admin", "/admin/:path*", "/dashboard", "/quiz", "/login", "/signup"],
};
