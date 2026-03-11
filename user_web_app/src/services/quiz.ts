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

export async function listQuizzes(): Promise<QuizSummary[]> {
  return apiFetch<QuizSummary[]>("backend", "/api/quizzes");
}

export async function getQuiz(slug: string): Promise<QuizDetails> {
  return apiFetch<QuizDetails>("backend", `/api/quizzes/${encodeURIComponent(slug)}`);
}

export async function submitQuizAttempt(quizId: string, answers: number[]): Promise<QuizAttemptResult> {
  return apiFetch<QuizAttemptResult>("backend", `/api/quizzes/${encodeURIComponent(quizId)}/attempts`, {
    method: "POST",
    body: { answers },
    retries: 0,
  });
}

export async function getLeaderboard() {
  return apiFetch("backend", "/api/quizzes/leaderboard");
}
