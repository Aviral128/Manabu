export type ApiEndpoint = {
  service: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description: string;
};

export const ENDPOINTS: ApiEndpoint[] = [
  { service: "backend", method: "GET", path: "/health", description: "Backend health check" },
  { service: "backend", method: "GET", path: "/v1/status", description: "Backend runtime status" },
  { service: "backend", method: "GET", path: "/v1/routes", description: "Backend route catalog" },

  { service: "auth", method: "POST", path: "/api/auth/signup", description: "Create a password-based account" },
  { service: "auth", method: "POST", path: "/api/auth/login", description: "Login with email and password" },
  { service: "auth", method: "POST", path: "/api/auth/magic-login", description: "Send a magic login link" },
  { service: "auth", method: "GET", path: "/api/auth/verify-magic", description: "Verify a magic login token" },
  { service: "auth", method: "POST", path: "/api/auth/forgot-password", description: "Send a password reset link" },
  { service: "auth", method: "POST", path: "/api/auth/reset-password", description: "Reset password with a token" },
  { service: "auth", method: "GET", path: "/api/auth/me", description: "Read the current authenticated profile" },
  { service: "auth", method: "PATCH", path: "/api/auth/me", description: "Update the current authenticated profile" },

  { service: "quiz", method: "GET", path: "/api/quizzes", description: "List public quizzes" },
  { service: "quiz", method: "GET", path: "/api/quizzes/leaderboard", description: "Read the quiz leaderboard" },
  { service: "quiz", method: "GET", path: "/api/quizzes/:slug", description: "Read a quiz by slug" },
  { service: "quiz", method: "POST", path: "/api/quizzes/:id/attempts", description: "Submit a quiz attempt" },

  { service: "admin", method: "GET", path: "/api/admin/summary", description: "Admin dashboard summary" },
  { service: "admin", method: "GET", path: "/api/admin/users", description: "List users for moderation" },
  { service: "admin", method: "PATCH", path: "/api/admin/users/:id", description: "Update a user" },
  { service: "admin", method: "DELETE", path: "/api/admin/users/:id", description: "Delete a user" },
  { service: "admin", method: "GET", path: "/api/admin/quizzes", description: "List quizzes for admin" },
  { service: "admin", method: "POST", path: "/api/admin/quizzes", description: "Create a quiz" },
  { service: "admin", method: "PUT", path: "/api/admin/quizzes/:id", description: "Update a quiz" },
  { service: "admin", method: "DELETE", path: "/api/admin/quizzes/:id", description: "Delete a quiz" },
  { service: "admin", method: "GET", path: "/api/admin/logs", description: "Read admin audit logs" },

  { service: "monitoring", method: "POST", path: "/api/monitoring/events", description: "Ingest client-side monitoring events" },
];
