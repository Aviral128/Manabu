import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

for (const envPath of [path.resolve(__dirname, "../../.env"), path.resolve(process.cwd(), ".env")]) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}

function normalizeDatabaseUrl(value: string) {
  return value.trim().replace(/^['"]+|['"]+$/g, "");
}

function isPostgresUrl(value: string) {
  return /^postgres(?:ql)?:\/\//i.test(value);
}

const databaseUrlSchema = z.string().min(1).transform(normalizeDatabaseUrl).refine(isPostgresUrl, {
  message: "DATABASE_URL must start with postgresql:// or postgres://",
});

const envSchema = z.object({
  PORT: z.coerce.number().default(7200),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: databaseUrlSchema,
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string().default("7d"),
  MANABU_ADMIN_EMAILS: z.string().default("admin@manabu.app,aviral@manabu.app,aviral.sultaniya@manabu.app"),
  CORS_ORIGINS: z.string().default("http://127.0.0.1:3000,http://127.0.0.1:3001,http://localhost:3000,http://localhost:3001,http://127.0.0.1:8081"),
});

const parsed = envSchema.parse(process.env);
process.env.DATABASE_URL = parsed.DATABASE_URL;

export const env = {
  ...parsed,
  adminEmails: parsed.MANABU_ADMIN_EMAILS.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean),
  corsOrigins: parsed.CORS_ORIGINS.split(",").map((item) => item.trim()).filter(Boolean),
};
