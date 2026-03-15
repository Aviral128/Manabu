export type UserProfile = {
  userId: string;
  displayName: string;
  email?: string;
  role?: "admin" | "manager" | "learner";
  status?: "active" | "suspended";
  avatarUrl?: string;
  leaderboard?: {
    points: number;
    level: number;
    badges: string[];
    streak: number;
  } | null;
  quizStats?: {
    totalQuizzesTaken: number;
    averageAccuracy: number;
    bestScore: number;
  };
  recentAttempts?: Array<{
    attemptId: string;
    quizId: string;
    quizTitle: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    completedAt: string;
  }>;
};

async function requestSession(): Promise<any> {
  let response: Response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12_000);
  try {
    response = await fetch("/api/auth/session", { cache: "no-store", signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Loading your session took too long. Please refresh and try again.");
    }
    throw new Error("Failed to load session. Please refresh and try again.");
  } finally {
    clearTimeout(timeoutId);
  }

  const raw = await response.text();
  let parsed: any = {};
  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch {
    parsed = {};
  }
  if (!response.ok) {
    throw new Error(parsed?.message ?? "Failed to load session.");
  }
  return parsed;
}

export async function fetchUserProfile(_userId: string): Promise<UserProfile> {
  const payload = await requestSession();
  if (!payload?.authenticated || !payload?.profile) {
    throw new Error("No active session found. Please log in again.");
  }
  return payload.profile as UserProfile;
}

export async function fetchLearningHistory(userId: string) {
  const profile = await fetchUserProfile(userId);
  return {
    recentActivity: (profile.recentAttempts ?? []).map((attempt) => ({
      type: "Quiz attempt",
      quiz: attempt.quizTitle,
      score: `${attempt.score}%`,
      result: `${attempt.correctAnswers}/${attempt.totalQuestions} correct`,
      completedAt: attempt.completedAt,
    })),
  };
}
