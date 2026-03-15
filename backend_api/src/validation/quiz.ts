import { z } from "zod";

export const quizQuestionSchema = z
  .object({
    prompt: z.string().min(5),
    options: z.array(z.string().min(1)).min(2),
    answerIndex: z.number().int().nonnegative(),
    explanation: z.string().optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  })
  .superRefine((value, context) => {
    if (value.answerIndex >= value.options.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["answerIndex"],
        message: "answerIndex must point to an existing option.",
      });
    }
  });

export const adminQuizSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]),
  estimatedMinutes: z.number().int().positive().max(180).optional(),
  isSpecial: z.boolean().optional(),
  tags: z.array(z.string().min(1)).optional(),
  questions: z.array(quizQuestionSchema).min(1),
});
