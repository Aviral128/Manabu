import { EmailOTPType } from "@prisma/client";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

import { env } from "../config/env";

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function generateOtpCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function getOtpExpiryDate() {
  return new Date(Date.now() + env.otpExpiryMinutes * 60_000);
}

export function hashOtpCode(email: string, type: EmailOTPType, otp: string) {
  return createHmac("sha256", env.otpSecret)
    .update(`${normalizeEmail(email)}:${type}:${otp}`)
    .digest("hex");
}

export function otpMatches(email: string, type: EmailOTPType, otp: string, otpHash: string) {
  const expected = Buffer.from(hashOtpCode(email, type, otp), "hex");
  const actual = Buffer.from(otpHash, "hex");

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
