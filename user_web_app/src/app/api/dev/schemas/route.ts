import fs from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { isAdmin } from "../../../../auth/server";

async function readText(p: string) {
  try {
    return await fs.readFile(p, "utf-8");
  } catch {
    return null;
  }
}

export async function GET() {
  const cookieStore = await cookies();

  if (!isAdmin(cookieStore)) {
    return NextResponse.json({ code: "FORBIDDEN", message: "Admin access is required." }, { status: 403 });
  }

  const repoRoot = path.resolve(process.cwd(), "..");

  const postgresPath = path.join(repoRoot, "database", "postgres", "schema.sql");
  const mongoPath = path.join(repoRoot, "database", "mongo", "collections.json");
  const redisPath = path.join(repoRoot, "database", "redis", "key_strategy.md");

  const [postgres, mongo, redis] = await Promise.all([readText(postgresPath), readText(mongoPath), readText(redisPath)]);

  return NextResponse.json({
    postgres: { path: postgresPath, content: postgres },
    mongo: { path: mongoPath, content: mongo },
    redis: { path: redisPath, content: redis },
  });
}
