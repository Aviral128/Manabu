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

const booleanFromEnvSchema = z.preprocess((value) => {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return value;

  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return value;
}, z.boolean().optional());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(7200),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: databaseUrlSchema,
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string().default("7d"),
  MANABU_ADMIN_EMAILS: z.string().default("admin@manabu.app,aviral@manabu.app,aviral.sultaniya@manabu.app"),
  CORS_ORIGINS: z.string().default("http://127.0.0.1:3000,http://127.0.0.1:3001,http://localhost:3000,http://localhost:3001,http://127.0.0.1:8081"),
  OTP_EXPIRY_MINUTES: z.coerce.number().int().min(1).max(30).default(10),
  OTP_SECRET: optionalStringSchema,
  SMTP_HOST: optionalStringSchema,
  SMTP_PORT: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") return undefined;
    return value;
  }, z.coerce.number().int().positive()).default(587),
  SMTP_SECURE: booleanFromEnvSchema.default(false),
  SMTP_USER: optionalStringSchema,
  SMTP_PASS: optionalStringSchema,
  SMTP_FROM_EMAIL: optionalEmailSchema,
  SMTP_FROM_NAME: z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }, z.string().min(1).default("MANABU")),
}).superRefine((value, context) => {
  const hasAnySmtpConfig = Boolean(value.SMTP_HOST || value.SMTP_USER || value.SMTP_PASS || value.SMTP_FROM_EMAIL);
  const hasFullSmtpConfig = Boolean(value.SMTP_HOST && value.SMTP_USER && value.SMTP_PASS && value.SMTP_FROM_EMAIL);

  if (hasAnySmtpConfig && !hasFullSmtpConfig) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM_EMAIL must all be set together.",
      path: ["SMTP_HOST"],
    });
  }

  if (value.NODE_ENV === "production" && !hasFullSmtpConfig) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "SMTP configuration is required in production for OTP email delivery.",
      path: ["SMTP_HOST"],
    });
  }
});

const parsed = envSchema.parse(process.env);
process.env.DATABASE_URL = parsed.DATABASE_URL;

export const env = {
  ...parsed,
  otpExpiryMinutes: parsed.OTP_EXPIRY_MINUTES,
  otpSecret: parsed.OTP_SECRET ?? parsed.JWT_SECRET,
  adminEmails: parsed.MANABU_ADMIN_EMAILS.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean),
  corsOrigins: parsed.CORS_ORIGINS.split(",").map((item) => item.trim()).filter(Boolean),
  smtp: {
    enabled: Boolean(parsed.SMTP_HOST && parsed.SMTP_USER && parsed.SMTP_PASS && parsed.SMTP_FROM_EMAIL),
    host: parsed.SMTP_HOST ?? "",
    port: parsed.SMTP_PORT,
    secure: parsed.SMTP_SECURE,
    user: parsed.SMTP_USER ?? "",
    pass: parsed.SMTP_PASS ?? "",
    fromEmail: parsed.SMTP_FROM_EMAIL ?? "",
    fromName: parsed.SMTP_FROM_NAME,
  },
};
