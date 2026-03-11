import { apiFetch } from "./http";

export type AdminQuizQuestion = {
  id?: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
  order?: number;
  difficulty: "easy" | "medium" | "hard";
};

export type AdminQuiz = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  estimatedMinutes: number;
  isSpecial: boolean;
  tags: string[];
  questionCount: number;
  difficultyCounts: { easy: number; medium: number; hard: number; mixed?: number };
  questions: AdminQuizQuestion[];
};

export type QuizPayload = {
  title: string;
  slug: string;
  description?: string;
  category?: string;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  estimatedMinutes?: number;
  isSpecial?: boolean;
  tags?: string[];
  questions: AdminQuizQuestion[];
};

export async function listAdminQuizzes(): Promise<AdminQuiz[]> {
  return apiFetch<AdminQuiz[]>("/api/proxy/backend/api/admin/quizzes");
}

export async function createAdminQuiz(payload: QuizPayload): Promise<AdminQuiz> {
  return apiFetch<AdminQuiz>("/api/proxy/backend/api/admin/quizzes", {
    method: "POST",
    body: payload,
    retries: 0,
  });
}

export async function updateAdminQuiz(id: string, payload: QuizPayload): Promise<AdminQuiz> {
  return apiFetch<AdminQuiz>(`/api/proxy/backend/api/admin/quizzes/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: payload,
    retries: 0,
  });
}

export async function deleteAdminQuiz(id: string) {
  return apiFetch<{ success: true }>(`/api/proxy/backend/api/admin/quizzes/${encodeURIComponent(id)}`, {
    method: "DELETE",
    retries: 0,
  });
}

export async function listQuestionCatalog() {
  const quizzes = await listAdminQuizzes();
  const items = quizzes.flatMap((quiz) =>
    quiz.questions.map((question) => ({
      quizId: quiz.id,
      quizTitle: quiz.title,
      ...question,
    }))
  );
  return { items };
}
