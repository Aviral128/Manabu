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
