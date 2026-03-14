import crypto from "node:crypto";

export function generateMagicToken() {
  return crypto.randomBytes(32).toString("hex");
}
