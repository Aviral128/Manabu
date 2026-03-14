import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_COOKIES } from "./auth/shared";

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/app") && !pathname.startsWith("/dev")) {
    return NextResponse.next();
  }

  const authenticated = request.cookies.get(AUTH_COOKIES.authenticated)?.value === "1";
  const accessToken = request.cookies.get(AUTH_COOKIES.accessToken)?.value;
  const role = request.cookies.get(AUTH_COOKIES.role)?.value;

  if (!authenticated || !accessToken) {
    return redirectToLogin(request);
  }

  if (pathname.startsWith("/dev") && role !== "admin") {
    return NextResponse.redirect(new URL("/app/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/dev/:path*"],
};
