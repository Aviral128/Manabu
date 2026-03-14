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

const optionalStringSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}, z.string().min(1).optional());

const optionalEmailSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}, z.string().email().optional());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(7200),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: databaseUrlSchema,
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string().default("7d"),
  MANABU_ADMIN_EMAILS: z.string().default("admin@manabu.app,aviral@manabu.app,aviral.sultaniya@manabu.app"),
  CORS_ORIGINS: z.string().default("http://127.0.0.1:3000,http://127.0.0.1:3001,http://localhost:3000,http://localhost:3001,http://127.0.0.1:8081"),
  RESEND_API_KEY: optionalStringSchema,
  MAGIC_LINK_EXPIRY: z.coerce.number().int().min(1).max(60).default(10),
  MANABU_WEB_URL: z.string().url().default("https://manabu-mu.vercel.app"),
  RESEND_FROM_EMAIL: optionalEmailSchema,
}).superRefine((value, context) => {
  if (value.NODE_ENV === "production" && !value.RESEND_API_KEY) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "RESEND_API_KEY is required in production for magic-link and password reset email delivery.",
      path: ["RESEND_API_KEY"],
    });
  }
});

const parsed = envSchema.parse(process.env);
process.env.DATABASE_URL = parsed.DATABASE_URL;

export const env = {
  ...parsed,
  resendApiKey: parsed.RESEND_API_KEY ?? "",
  magicLinkExpiryMinutes: parsed.MAGIC_LINK_EXPIRY,
  webBaseUrl: parsed.MANABU_WEB_URL.replace(/\/+$/, ""),
  resendFromEmail: parsed.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
  adminEmails: parsed.MANABU_ADMIN_EMAILS.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean),
  corsOrigins: parsed.CORS_ORIGINS.split(",").map((item) => item.trim()).filter(Boolean),
};
