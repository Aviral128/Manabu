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
  MAGIC_LINK_EXPIRY: z.coerce.number().int().min(1).max(60).default(10),
  MANABU_WEB_URL: z.string().url().default("https://manabu-mu.vercel.app"),
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().int().positive().default(465),
  SMTP_USER: optionalEmailSchema,
  SMTP_PASS: optionalStringSchema,
  SMTP_FROM: optionalStringSchema,
}).superRefine((value, context) => {
  if (value.NODE_ENV === "production") {
    if (!value.SMTP_USER) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "SMTP_USER is required in production for Gmail SMTP delivery.",
        path: ["SMTP_USER"],
      });
    }
    if (!value.SMTP_PASS) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "SMTP_PASS is required in production for Gmail SMTP delivery.",
        path: ["SMTP_PASS"],
      });
    }
    if (!value.SMTP_FROM) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "SMTP_FROM is required in production for Gmail SMTP delivery.",
        path: ["SMTP_FROM"],
      });
    }
  }
});

const parsed = envSchema.parse(process.env);
process.env.DATABASE_URL = parsed.DATABASE_URL;

export const env = {
  ...parsed,
  magicLinkExpiryMinutes: parsed.MAGIC_LINK_EXPIRY,
  webBaseUrl: parsed.MANABU_WEB_URL.replace(/\/+$/, ""),
  smtpHost: parsed.SMTP_HOST.trim(),
  smtpPort: parsed.SMTP_PORT,
  smtpUser: parsed.SMTP_USER ?? "",
  smtpPass: parsed.SMTP_PASS ?? "",
  smtpFrom: parsed.SMTP_FROM ?? "",
  adminEmails: parsed.MANABU_ADMIN_EMAILS.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean),
  corsOrigins: parsed.CORS_ORIGINS.split(",").map((item) => item.trim()).filter(Boolean),
};
