import { Difficulty } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

type DifficultyInput = "easy" | "medium" | "hard" | "mixed";
type QuestionInput = {
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
};
type QuizInput = {
  title: string;
  slug: string;
  description?: string;
  category?: string;
  difficulty: DifficultyInput;
  estimatedMinutes?: number;
  isSpecial?: boolean;
  tags?: string[];
  questions: QuestionInput[];
};
type LoadedQuiz = Awaited<ReturnType<typeof loadQuizById>>;

function toDifficulty(input: DifficultyInput | "easy" | "medium" | "hard") {
  return Difficulty[input.toUpperCase() as keyof typeof Difficulty];
}

async function loadQuizById(id: string) {
  const quiz = await prisma.quiz.findUnique({ where: { id }, include: { questions: true } });
  if (!quiz) {
    throw new AppError(404, "QUIZ_NOT_FOUND", "Quiz not found.");
  }
  return quiz;
}

function buildDifficultyCounts(questions: Array<{ difficulty: Difficulty }>) {
  return questions.reduce(
    (counts, question) => {
      const key = question.difficulty.toLowerCase() as "easy" | "medium" | "hard" | "mixed";
      counts[key] += 1;
      return counts;
    },
    { easy: 0, medium: 0, hard: 0, mixed: 0 }
  );
}

function sortQuestions<T extends { order: number }>(questions: T[]) {
  return [...questions].sort((left, right) => left.order - right.order);
}

function mapQuizSummary(quiz: Awaited<ReturnType<typeof loadQuizById>>) {
  const questions = sortQuestions(quiz.questions);
  return {
    id: quiz.id,
    title: quiz.title,
    slug: quiz.slug,
    description: quiz.description,
    category: quiz.category,
    difficulty: quiz.difficulty.toLowerCase(),
    estimatedMinutes: quiz.estimatedMinutes,
    isSpecial: quiz.isSpecial,
    tags: Array.isArray(quiz.tags) ? (quiz.tags as string[]) : [],
    questionCount: questions.length,
    difficultyCounts: buildDifficultyCounts(questions),
    updatedAt: quiz.updatedAt,
  };
}

function mapQuizForLearner(quiz: LoadedQuiz) {
  return {
    ...mapQuizSummary(quiz),
    questions: sortQuestions(quiz.questions).map((question) => ({
      id: question.id,
      prompt: question.prompt,
      options: question.options as string[],
      explanation: question.explanation,
      order: question.order,
      difficulty: question.difficulty.toLowerCase(),
    })),
  };
}

function mapQuizForAdmin(quiz: LoadedQuiz) {
  return {
    ...mapQuizSummary(quiz),
    questions: sortQuestions(quiz.questions).map((question) => ({
      id: question.id,
      prompt: question.prompt,
      options: question.options as string[],
      answerIndex: question.answerIndex,
      explanation: question.explanation,
      order: question.order,
      difficulty: question.difficulty.toLowerCase(),
    })),
  };
}

export async function listQuizzes() {
  const quizzes = await prisma.quiz.findMany({ include: { questions: true }, orderBy: [{ isSpecial: "desc" }, { createdAt: "desc" }] });
  return quizzes.map((quiz) => mapQuizSummary(quiz));
}

export async function getQuizBySlug(slug: string) {
  const quiz = await prisma.quiz.findUnique({ where: { slug }, include: { questions: true } });
  if (!quiz) {
    throw new AppError(404, "QUIZ_NOT_FOUND", "Quiz not found.");
  }
  return mapQuizForLearner(quiz);
}

export async function listAdminQuizzes() {
  const quizzes = await prisma.quiz.findMany({ include: { questions: true }, orderBy: [{ isSpecial: "desc" }, { updatedAt: "desc" }] });
  return quizzes.map((quiz) => mapQuizForAdmin(quiz));
}

export async function createQuiz(input: QuizInput) {
  const quiz = await prisma.quiz.create({
    data: {
      title: input.title,
      slug: input.slug,
      description: input.description,
      category: input.category,
      difficulty: toDifficulty(input.difficulty),
      estimatedMinutes: input.estimatedMinutes ?? 15,
      isSpecial: input.isSpecial ?? false,
      tags: input.tags ?? [],
      questions: {
        create: input.questions.map((question, index) => ({
          prompt: question.prompt,
          options: question.options,
          answerIndex: question.answerIndex,
          explanation: question.explanation,
          order: index + 1,
          difficulty: toDifficulty(question.difficulty ?? input.difficulty),
        })),
      },
    },
    include: { questions: true },
  });

  return mapQuizForAdmin(quiz);
}

export async function updateQuiz(id: string, input: QuizInput) {
  await prisma.question.deleteMany({ where: { quizId: id } });

  const quiz = await prisma.quiz.update({
    where: { id },
    data: {
      title: input.title,
      slug: input.slug,
      description: input.description,
      category: input.category,
      difficulty: toDifficulty(input.difficulty),
      estimatedMinutes: input.estimatedMinutes ?? 15,
      isSpecial: input.isSpecial ?? false,
      tags: input.tags ?? [],
      questions: {
        create: input.questions.map((question, index) => ({
          prompt: question.prompt,
          options: question.options,
          answerIndex: question.answerIndex,
          explanation: question.explanation,
          order: index + 1,
          difficulty: toDifficulty(question.difficulty ?? input.difficulty),
        })),
      },
    },
    include: { questions: true },
  });

  return mapQuizForAdmin(quiz);
}

export async function deleteQuiz(id: string) {
  await prisma.quiz.delete({ where: { id } });
  return { success: true as const };
}

export async function recordAttempt(input: { userId: string; quizId: string; answers: number[] }) {
  const quiz = await loadQuizById(input.quizId);
  const orderedQuestions = sortQuestions(quiz.questions);

  const review = orderedQuestions.map((question, index) => {
    const selectedIndex = input.answers[index] ?? -1;
    const isCorrect = selectedIndex === question.answerIndex;
    return {
      questionId: question.id,
      prompt: question.prompt,
      selectedIndex,
      correctIndex: question.answerIndex,
      isCorrect,
      explanation: question.explanation,
      difficulty: question.difficulty.toLowerCase(),
    };
  });

  const correctAnswers = review.filter((item) => item.isCorrect).length;
  const totalQuestions = orderedQuestions.length;
  const score = totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const xpEarned = Math.max(10, correctAnswers * 10);

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: input.userId,
      quizId: input.quizId,
      score,
      xpEarned,
      correctAnswers,
      totalQuestions,
    },
  });

  const nextLeaderboard = await prisma.leaderboard.upsert({
    where: { userId: input.userId },
    update: {
      points: { increment: xpEarned },
      streak: { increment: 1 },
    },
    create: {
      userId: input.userId,
      points: xpEarned,
      level: 1,
      badges: [],
      streak: 1,
    },
  });

  const totalPoints = nextLeaderboard.points;
  const level = Math.max(1, Math.floor(totalPoints / 150) + 1);
  const badges = Array.from(
    new Set([
      ...(Array.isArray(nextLeaderboard.badges) ? (nextLeaderboard.badges as string[]) : []),
      ...(score >= 90 ? ["High Score"] : []),
      ...(nextLeaderboard.streak >= 7 ? ["7 Day Streak"] : []),
    ])
  );

  await prisma.leaderboard.update({
    where: { userId: input.userId },
    data: { level, badges },
  });

  return {
    success: true as const,
    attemptId: attempt.id,
    xpEarned,
    score,
    correctAnswers,
    totalQuestions,
    review,
  };
}

export async function leaderboard() {
  const rows = await prisma.leaderboard.findMany({ include: { user: true }, orderBy: { points: "desc" }, take: 20 });
  return rows.map((row, index) => ({
    rank: index + 1,
    userId: row.userId,
    displayName: row.user.name,
    points: row.points,
    level: row.level,
    streak: row.streak,
    avatarUrl: row.user.avatarUrl ?? undefined,
  }));
}
