import type { Request, Response } from "express";
import { z } from "zod";

import * as quizService from "../services/quizService";

const questionSchema = z.object({
  prompt: z.string().min(5),
  options: z.array(z.string().min(1)).min(2),
  answerIndex: z.number().int().nonnegative(),
  explanation: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

const quizSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]),
  estimatedMinutes: z.number().int().positive().max(180).optional(),
  isSpecial: z.boolean().optional(),
  tags: z.array(z.string().min(1)).optional(),
  questions: z.array(questionSchema).min(1),
});

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
  const input = quizSchema.parse(request.body);
  const quiz = await quizService.createQuiz(input);
  return response.status(201).json(quiz);
}

export async function updateQuiz(request: Request, response: Response) {
  const input = quizSchema.parse(request.body);
  const quiz = await quizService.updateQuiz(routeParam(request.params.id), input);
  return response.json(quiz);
}

export async function deleteQuiz(request: Request, response: Response) {
  return response.json(await quizService.deleteQuiz(routeParam(request.params.id)));
}

export async function leaderboard(_request: Request, response: Response) {
  return response.json(await quizService.leaderboard());
}
