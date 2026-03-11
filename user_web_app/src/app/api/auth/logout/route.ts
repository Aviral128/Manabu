import { NextResponse } from "next/server";

import { clearSessionCookies } from "../../../../auth/server";

export async function POST(request: Request) {
  const response = NextResponse.json({ success: true });
  clearSessionCookies(response, new URL(request.url).protocol === "https:");
  return response;
}
