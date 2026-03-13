import type { Request, Response } from "express";
import { z } from "zod";

import * as authService from "../services/authService";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const emailSchema = z.object({
  email: z.string().email(),
});

const verifyEmailSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit code."),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit code."),
  newPassword: z.string().min(8),
});

const updateProfileSchema = z.object({
  displayName: z.string().min(2).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export async function signup(request: Request, response: Response) {
  const input = signupSchema.parse(request.body);
  const result = await authService.signup(input);
  return response.status(201).json(result);
}

export async function login(request: Request, response: Response) {
  const input = loginSchema.parse(request.body);
  const result = await authService.login(input);
  return response.json(result);
}

export async function me(request: Request, response: Response) {
  const result = await authService.getProfile(request.user!.userId);
  return response.json(result);
}

export async function updateMe(request: Request, response: Response) {
  const input = updateProfileSchema.parse(request.body);
  const result = await authService.updateProfile(request.user!.userId, input);
  return response.json({ success: true, user: result });
}

export async function sendVerificationOtp(request: Request, response: Response) {
  const input = emailSchema.parse(request.body);
  const result = await authService.sendVerificationOtp(input);
  return response.json(result);
}

export async function verifyEmail(request: Request, response: Response) {
  const input = verifyEmailSchema.parse(request.body);
  const result = await authService.verifyEmail(input);
  return response.json(result);
}

export async function forgotPassword(request: Request, response: Response) {
  const input = emailSchema.parse(request.body);
  const result = await authService.forgotPassword(input);
  return response.json(result);
}

export async function resetPassword(request: Request, response: Response) {
  const input = resetPasswordSchema.parse(request.body);
  const result = await authService.resetPassword(input);
  return response.json(result);
}
