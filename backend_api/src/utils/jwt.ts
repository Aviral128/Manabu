import jwt, { type SignOptions } from "jsonwebtoken";

import { env } from "../config/env";

export type TokenPayload = {
  userId: string;
  email: string;
  role: "admin" | "manager" | "learner";
};

export function signToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
