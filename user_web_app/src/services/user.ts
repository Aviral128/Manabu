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
  const response = await fetch("/api/auth/session", { cache: "no-store" });
  const payload = (await response.json().catch(() => ({}))) as any;
  if (!response.ok) {
    throw new Error(payload?.message ?? "Failed to load session.");
  }
  return payload;
}

export async function fetchUserProfile(_userId: string): Promise<UserProfile> {
  const payload = await requestSession();
  if (!payload?.authenticated || !payload?.profile) {
    throw new Error("No active session found.");
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
