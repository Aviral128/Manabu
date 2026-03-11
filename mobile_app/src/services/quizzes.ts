import { apiClient } from "./api/client";

export type MobileQuizSummary = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  difficulty: string;
  estimatedMinutes: number;
  isSpecial: boolean;
  questionCount: number;
  difficultyCounts: { easy: number; medium: number; hard: number; mixed?: number };
};

export type MobileQuizDetails = MobileQuizSummary & {
  questions: Array<{
    id: string;
    prompt: string;
    options: string[];
    explanation?: string;
    order: number;
    difficulty: string;
  }>;
};

export type MobileQuizAttempt = {
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

export async function listQuizzes() {
  const response = await apiClient.get("/api/quizzes");
  return response.data as MobileQuizSummary[];
}

export async function getQuiz(slug: string) {
  const response = await apiClient.get(`/api/quizzes/${encodeURIComponent(slug)}`);
  return response.data as MobileQuizDetails;
}

export async function submitQuizAttempt(quizId: string, answers: number[]) {
  const response = await apiClient.post(`/api/quizzes/${encodeURIComponent(quizId)}/attempts`, { answers });
  return response.data as MobileQuizAttempt;
}

export async function fetchAdminSummary() {
  const response = await apiClient.get("/api/admin/summary");
  return response.data as {
    users: number;
    activeUsers: number;
    suspendedUsers: number;
    quizzes: number;
    attempts: number;
    monitoringEvents: number;
    generatedAt: string;
  };
}
