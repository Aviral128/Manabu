import type { Request, Response } from "express";
import { z } from "zod";

import { deleteUser, listUsers, updateUser } from "../services/authService";
import { getAdminSummary, listAdminLogs, logAdminAction } from "../services/adminService";
import * as quizService from "../services/quizService";

const userUpdateSchema = z.object({
  displayName: z.string().min(2).optional(),
  role: z.enum(["admin", "learner"]).optional(),
  status: z.enum(["pending", "active", "suspended"]).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

function routeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export async function summaryController(_request: Request, response: Response) {
  return response.json(await getAdminSummary());
}

export async function listUsersController(_request: Request, response: Response) {
  return response.json(await listUsers());
}

export async function updateUserController(request: Request, response: Response) {
  const userId = routeParam(request.params.id);
  const input = userUpdateSchema.parse(request.body);
  const user = await updateUser(userId, input);
  await logAdminAction({
    actorId: request.user?.userId,
    action: "user.update",
    targetType: "user",
    targetId: userId,
    metadata: input,
  });
  return response.json({ success: true, user });
}

export async function deleteUserController(request: Request, response: Response) {
  const userId = routeParam(request.params.id);
  const result = await deleteUser(userId);
  await logAdminAction({
    actorId: request.user?.userId,
    action: "user.delete",
    targetType: "user",
    targetId: userId,
  });
  return response.json(result);
}

export async function listQuizzesController(_request: Request, response: Response) {
  return response.json(await quizService.listAdminQuizzes());
}

export async function createQuizController(request: Request, response: Response) {
  const quiz = await quizService.createQuiz(request.body);
  await logAdminAction({
    actorId: request.user?.userId,
    action: "quiz.create",
    targetType: "quiz",
    targetId: quiz.id,
    metadata: { title: quiz.title },
  });
  return response.status(201).json(quiz);
}

export async function updateQuizController(request: Request, response: Response) {
  const quizId = routeParam(request.params.id);
  const quiz = await quizService.updateQuiz(quizId, request.body);
  await logAdminAction({
    actorId: request.user?.userId,
    action: "quiz.update",
    targetType: "quiz",
    targetId: quizId,
    metadata: { title: quiz.title },
  });
  return response.json(quiz);
}

export async function deleteQuizController(request: Request, response: Response) {
  const quizId = routeParam(request.params.id);
  const result = await quizService.deleteQuiz(quizId);
  await logAdminAction({
    actorId: request.user?.userId,
    action: "quiz.delete",
    targetType: "quiz",
    targetId: quizId,
  });
  return response.json(result);
}

export async function logsController(_request: Request, response: Response) {
  return response.json(await listAdminLogs());
}
