import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(7200),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string().default("7d"),
  MANABU_ADMIN_EMAILS: z.string().default("admin@manabu.app,aviral@manabu.app,aviral.sultaniya@manabu.app"),
  CORS_ORIGINS: z.string().default("http://127.0.0.1:3000,http://127.0.0.1:3001,http://localhost:3000,http://localhost:3001,http://127.0.0.1:8081"),
});

const parsed = envSchema.parse(process.env);

export const env = {
  ...parsed,
  adminEmails: parsed.MANABU_ADMIN_EMAILS.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean),
  corsOrigins: parsed.CORS_ORIGINS.split(",").map((item) => item.trim()).filter(Boolean),
};
