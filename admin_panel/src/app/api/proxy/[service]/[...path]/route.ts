import { NextRequest, NextResponse } from "next/server";

const DEFAULTS: Record<string, string> = {
  gateway: "http://127.0.0.1:7000",
  auth: "http://127.0.0.1:7001",
  user: "http://127.0.0.1:7002",
  quiz: "http://127.0.0.1:7003",
  learning: "http://127.0.0.1:7004",
  gamification: "http://127.0.0.1:7005",
  social: "http://127.0.0.1:7006",
  analytics: "http://127.0.0.1:7007",
  content: "http://127.0.0.1:7008",
  notifications: "http://127.0.0.1:7009",
  sync: "http://127.0.0.1:7010",
  recommendations: "http://127.0.0.1:7011",
  ai: "http://127.0.0.1:7100",
  backend: "http://127.0.0.1:7200",
};

function upstreamBase(service: string): string {
  const envKey = `MANABU_${service.toUpperCase()}_URL`;
  return (process.env as any)[envKey] ?? DEFAULTS[service];
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
