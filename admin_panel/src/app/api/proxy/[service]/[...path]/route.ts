import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "../../../../../config/api";

const KNOWN_SERVICES = new Set([
  "gateway",
  "auth",
  "user",
  "quiz",
  "learning",
  "gamification",
  "social",
  "analytics",
  "content",
  "notifications",
  "sync",
  "recommendations",
  "ai",
  "backend",
]);

function upstreamBase(service: string): string | null {
  if (!KNOWN_SERVICES.has(service)) return null;
  const envKey = `MANABU_${service.toUpperCase()}_URL`;
  return (process.env as any)[envKey] ?? API_BASE_URL;
}

async function handleProxy(request: NextRequest, ctx: { params: { service: string; path: string[] } }) {
  const { service, path } = ctx.params;
  const base = upstreamBase(service);
  if (!base) {
    return NextResponse.json({ code: "UNKNOWN_SERVICE", message: `Unknown service: ${service}` }, { status: 400 });
  }

  const upstreamUrl = new URL(request.nextUrl.toString());
  upstreamUrl.pathname = [new URL(base).pathname.replace(/\/$/, ""), ...path].join("/").replace(/\/+/g, "/");
  upstreamUrl.host = new URL(base).host;
  upstreamUrl.protocol = new URL(base).protocol;

  const headers = new Headers(request.headers);
  headers.delete("host");

  const init: RequestInit = {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
    cache: "no-store",
  };

  const response = await fetch(upstreamUrl.toString(), init);
  const body = await response.arrayBuffer();

  const out = new NextResponse(body, { status: response.status });
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "transfer-encoding") return;
    out.headers.set(key, value);
  });
  out.headers.set("x-manabu-proxy", "admin_panel");
  return out;
}

export async function GET(request: NextRequest, ctx: any) {
  return handleProxy(request, ctx);
}
export async function POST(request: NextRequest, ctx: any) {
  return handleProxy(request, ctx);
}
export async function PUT(request: NextRequest, ctx: any) {
  return handleProxy(request, ctx);
}
export async function PATCH(request: NextRequest, ctx: any) {
  return handleProxy(request, ctx);
}
export async function DELETE(request: NextRequest, ctx: any) {
  return handleProxy(request, ctx);
}
