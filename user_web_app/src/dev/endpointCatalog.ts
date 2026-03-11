export type ApiEndpoint = {
  service: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description: string;
};

export const ENDPOINTS: ApiEndpoint[] = [
  { service: "gateway", method: "GET", path: "/v1/routes", description: "Gateway route catalog" },
  { service: "gateway", method: "GET", path: "/v1/status", description: "Gateway status" },

  { service: "auth", method: "POST", path: "/v1/auth/register", description: "Register a user" },
  { service: "auth", method: "POST", path: "/v1/auth/login", description: "Login and receive tokens" },
  { service: "auth", method: "POST", path: "/v1/auth/password/recover", description: "Password recovery (mock)" },

  { service: "user", method: "GET", path: "/v1/users/:id", description: "Fetch user profile" },
  { service: "user", method: "PUT", path: "/v1/users/:id/preferences", description: "Update preferences" },
  { service: "user", method: "GET", path: "/v1/users/:id/history", description: "Fetch learning history" },

  { service: "quiz", method: "POST", path: "/v1/quiz/sessions", description: "Create a quiz session" },
  { service: "quiz", method: "POST", path: "/v1/quiz/sessions/:sessionId/submit", description: "Submit quiz answers" },
  { service: "quiz", method: "GET", path: "/v1/quiz/questions", description: "List question catalog" },

  { service: "learning", method: "GET", path: "/v1/learning/plan/:userId", description: "Fetch learning plan" },
  { service: "learning", method: "GET", path: "/v1/learning/knowledge-graph/:userId", description: "Fetch knowledge graph" },

  { service: "gamification", method: "GET", path: "/v1/gamification/profile/:userId", description: "Fetch gamification profile" },
  { service: "gamification", method: "GET", path: "/v1/gamification/rewards/:userId", description: "Fetch rewards" },

  { service: "social", method: "GET", path: "/v1/social/friends/:userId", description: "Fetch friends" },
  { service: "social", method: "GET", path: "/v1/social/leaderboard/global", description: "Fetch global leaderboard" },
  { service: "social", method: "POST", path: "/v1/social/battles", description: "Create battle session" },

  { service: "analytics", method: "GET", path: "/v1/analytics/dashboard/:userId", description: "User analytics dashboard" },
  { service: "analytics", method: "POST", path: "/v1/analytics/events", description: "Ingest analytics event" },
  { service: "analytics", method: "GET", path: "/v1/analytics/retention", description: "Retention snapshot" },

  { service: "content", method: "POST", path: "/v1/content/questions", description: "Create question draft" },
  { service: "content", method: "GET", path: "/v1/content/courses/:courseId", description: "Fetch course" },
  { service: "content", method: "POST", path: "/v1/content/moderation/queue", description: "Moderation queue" },

  { service: "notifications", method: "POST", path: "/v1/notifications/daily-challenge", description: "Schedule daily challenge" },
  { service: "notifications", method: "POST", path: "/v1/notifications/reminders", description: "Send reminders" },
  { service: "notifications", method: "POST", path: "/v1/notifications/achievements", description: "Achievement push" },

  { service: "sync", method: "POST", path: "/v1/sync/offline-batch", description: "Submit offline batch" },
  { service: "sync", method: "GET", path: "/v1/sync/conflicts/:userId", description: "List conflicts" },
  { service: "sync", method: "POST", path: "/v1/sync/checkpoint/:userId", description: "Create checkpoint token" },

  { service: "recommendations", method: "GET", path: "/v1/recommendations/next/:userId", description: "Get recommendations" },
  { service: "recommendations", method: "POST", path: "/v1/recommendations/feedback", description: "Send feedback" },

  { service: "ai", method: "POST", path: "/v1/ai/weak-topics", description: "Weak-topic detection" },
  { service: "ai", method: "POST", path: "/v1/ai/question-generation", description: "Question generation" },
  { service: "ai", method: "POST", path: "/v1/ai/tutor-explanation", description: "Tutor explanation" },
  { service: "ai", method: "POST", path: "/v1/ai/personalized-plan", description: "Personalized plan" },
  { service: "ai", method: "POST", path: "/v1/ai/knowledge-graph", description: "Knowledge graph" },
];

