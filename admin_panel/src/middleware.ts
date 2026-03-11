import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function normalizeHost(host: string): string {
  return host.replace(/^0\.0\.0\.0((?::)|$)/, "127.0.0.1$1");
}

function getRequestOrigin(request: NextRequest): string {
  const host = normalizeHost(request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "127.0.0.1:3001");
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "") ?? "http";
  return `${proto}://${host}`;
}

function getUserAppBaseUrl(request: NextRequest): string {
  if (process.env.MANABU_USER_APP_URL) {
    return process.env.MANABU_USER_APP_URL;
  }

  const host = normalizeHost(request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "127.0.0.1:3001");
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "") ?? "http";
  return `${proto}://${host.replace(":3001", ":3000")}`;
}

export function middleware(request: NextRequest) {
  const role = request.cookies.get("manabu_role")?.value;
  if (role === "admin") {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", getUserAppBaseUrl(request));
  loginUrl.searchParams.set("next", `${getRequestOrigin(request)}${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*|api).*)"],
};
