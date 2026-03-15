import { apiFetch } from "./http";

export type QuizSummary = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  difficulty: string;
  estimatedMinutes: number;
  isSpecial: boolean;
  tags: string[];
  questionCount: number;
  difficultyCounts: { easy: number; medium: number; hard: number; mixed?: number };
};

export type QuizDetails = QuizSummary & {
  questions: Array<{
    id: string;
    prompt: string;
    options: string[];
    explanation?: string;
    order: number;
    difficulty: string;
  }>;
};

export type QuizAttemptResult = {
  success: true;
  attemptId: string;
  xpEarned: number;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  review: Array<{
    questionId: string;
    prompt: string;
    selectedIndex: number;
    correctIndex: number;
    isCorrect: boolean;
    explanation?: string;
    difficulty: string;
  }>;
};

export type QuizAttemptPayload = {
  answers: number[];
  questionIds?: string[];
};

function toFriendlyQuizError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message.trim() : "";
  if (!message) return fallback;
  if (/quiz not found/i.test(message)) return "This quiz is no longer available.";
  if (/invalid attempt/i.test(message)) return "Your answers could not be submitted. Please review the quiz and try again.";
  if (/network|reachable|failed to fetch|timeout/i.test(message)) return fallback;
  return message;
}

export async function listQuizzes(): Promise<QuizSummary[]> {
  try {
    return await apiFetch<QuizSummary[]>("backend", "/api/quizzes");
  } catch (error) {
    throw new Error(toFriendlyQuizError(error, "Failed to load the quiz catalog. Please refresh and try again."));
  }
}

export async function getQuiz(slug: string): Promise<QuizDetails> {
  try {
    return await apiFetch<QuizDetails>("backend", `/api/quizzes/${encodeURIComponent(slug)}`);
  } catch (error) {
    throw new Error(toFriendlyQuizError(error, "Failed to load quiz. Please refresh and try again."));
  }
}

export async function submitQuizAttempt(quizId: string, payload: QuizAttemptPayload): Promise<QuizAttemptResult> {
  try {
    return await apiFetch<QuizAttemptResult>("backend", `/api/quizzes/${encodeURIComponent(quizId)}/attempts`, {
      method: "POST",
      body: payload,
      retries: 0,
    });
  } catch (error) {
    throw new Error(toFriendlyQuizError(error, "We could not submit this quiz. Please try again."));
  }
}

export async function getLeaderboard() {
  return apiFetch("backend", "/api/quizzes/leaderboard");
}
