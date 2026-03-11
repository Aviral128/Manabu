import { apiClient } from "./api/client";

export type MobileUser = {
  userId: string;
  displayName: string;
  email: string;
  role: "admin" | "learner";
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

export async function login(email: string, password: string) {
  try {
    const response = await apiClient.post("/api/auth/login", { email, password });
    return response.data as { success: true; token: string; user: MobileUser };
  } catch (error: any) {
    const message =
      error?.response?.data?.message ??
      error?.message ??
      "Login failed because the MANABU server is not reachable right now.";
    throw new Error(message);
  }
}

export async function signup(name: string, email: string, password: string) {
  try {
    const response = await apiClient.post("/api/auth/signup", { name, email, password });
    return response.data as { success: true; token: string; user: MobileUser };
  } catch (error: any) {
    const message =
      error?.response?.data?.message ??
      error?.message ??
      "Signup failed because the MANABU server is not reachable right now.";
    throw new Error(message);
  }
}

export async function fetchProfile() {
  try {
    const response = await apiClient.get("/api/auth/me");
    return response.data as MobileUser;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ??
      error?.message ??
      "Profile sync failed because the MANABU server is not reachable right now.";
    throw new Error(message);
  }
}
