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

const PRESET_ADMIN_EMAILS: string[] = ["sultaniyaaviral@gmail.com", "codemva2025@gmail.com"];

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(7200),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: databaseUrlSchema,
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGINS: z.string().default("http://127.0.0.1:3000,http://127.0.0.1:3001,http://localhost:3000,http://localhost:3001,http://127.0.0.1:8081"),
  MAGIC_LINK_EXPIRY: z.coerce.number().int().min(1).max(60).default(10),
  MANABU_WEB_URL: z.string().url().default("https://manabu-mu.vercel.app"),
  BREVO_API_KEY: optionalStringSchema,
  BREVO_FROM_EMAIL: optionalEmailSchema,
  BREVO_FROM_NAME: optionalStringSchema,
}).superRefine((value, context) => {
  if (value.NODE_ENV === "production") {
    if (!value.BREVO_API_KEY) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "BREVO_API_KEY is required in production for Brevo email delivery.",
        path: ["BREVO_API_KEY"],
      });
    }
    if (!value.BREVO_FROM_EMAIL) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "BREVO_FROM_EMAIL is required in production for Brevo email delivery.",
        path: ["BREVO_FROM_EMAIL"],
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
  brevoApiKey: parsed.BREVO_API_KEY ?? "",
  brevoFromEmail: parsed.BREVO_FROM_EMAIL ?? "",
  brevoFromName: parsed.BREVO_FROM_NAME ?? "MANABU",
  adminEmails: [...PRESET_ADMIN_EMAILS],
  corsOrigins: parsed.CORS_ORIGINS.split(",").map((item) => item.trim()).filter(Boolean),
};
