import type { Request, Response } from "express";
import { z } from "zod";

import * as quizService from "../services/quizService";
import { adminQuizSchema } from "../validation/quiz";

const attemptSchema = z.object({
  answers: z.array(z.number().int().min(-1)).min(1),
  questionIds: z.array(z.string().min(1)).min(1).optional(),
}).superRefine((value, context) => {
  if (value.questionIds && value.questionIds.length !== value.answers.length) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["questionIds"],
      message: "questionIds must match the number of answers.",
    });
  }
});

function routeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export async function listQuizzes(_request: Request, response: Response) {
  return response.json(await quizService.listQuizzes());
}

export async function getQuiz(request: Request, response: Response) {
  return response.json(await quizService.getQuizBySlug(routeParam(request.params.slug)));
}

export async function recordAttempt(request: Request, response: Response) {
  const input = attemptSchema.parse(request.body);
  return response.status(201).json(
    await quizService.recordAttempt({
      userId: request.user!.userId,
      quizId: routeParam(request.params.id),
      answers: input.answers,
      questionIds: input.questionIds,
    })
  );
}

export async function listAdminQuizzes(_request: Request, response: Response) {
  return response.json(await quizService.listAdminQuizzes());
}

export async function createQuiz(request: Request, response: Response) {
  const input = adminQuizSchema.parse(request.body);
  const quiz = await quizService.createQuiz(input);
  return response.status(201).json(quiz);
}

export async function updateQuiz(request: Request, response: Response) {
  const input = adminQuizSchema.parse(request.body);
  const quiz = await quizService.updateQuiz(routeParam(request.params.id), input);
  return response.json(quiz);
}

export async function deleteQuiz(request: Request, response: Response) {
  return response.json(await quizService.deleteQuiz(routeParam(request.params.id)));
}

export async function leaderboard(_request: Request, response: Response) {
  return response.json(await quizService.leaderboard());
}
