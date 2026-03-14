export type RouteCatalogEntry = {
  area: "system" | "auth" | "quiz" | "admin" | "monitoring";
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  auth: "public" | "user" | "admin";
  description: string;
};

export const ROUTE_CATALOG: RouteCatalogEntry[] = [
  { area: "system", method: "GET", path: "/health", auth: "public", description: "Backend health check" },
  { area: "system", method: "GET", path: "/v1/status", auth: "public", description: "Backend runtime status" },
  { area: "system", method: "GET", path: "/v1/routes", auth: "public", description: "Backend route catalog" },

  { area: "auth", method: "POST", path: "/api/auth/signup", auth: "public", description: "Create a password-based account" },
  { area: "auth", method: "POST", path: "/api/auth/login", auth: "public", description: "Login with email and password" },
  { area: "auth", method: "POST", path: "/api/auth/magic-login", auth: "public", description: "Send a magic login link" },
  { area: "auth", method: "GET", path: "/api/auth/verify-magic", auth: "public", description: "Verify a magic login token" },
  { area: "auth", method: "POST", path: "/api/auth/forgot-password", auth: "public", description: "Send a password reset link" },
  { area: "auth", method: "POST", path: "/api/auth/reset-password", auth: "public", description: "Reset password with a token" },
  { area: "auth", method: "GET", path: "/api/auth/me", auth: "user", description: "Read the current user profile" },
  { area: "auth", method: "PATCH", path: "/api/auth/me", auth: "user", description: "Update the current user profile" },

  { area: "quiz", method: "GET", path: "/api/quizzes", auth: "public", description: "List published quizzes" },
  { area: "quiz", method: "GET", path: "/api/quizzes/leaderboard", auth: "public", description: "Read the public leaderboard" },
  { area: "quiz", method: "GET", path: "/api/quizzes/:slug", auth: "public", description: "Read a quiz by slug" },
  { area: "quiz", method: "POST", path: "/api/quizzes/:id/attempts", auth: "user", description: "Submit a quiz attempt" },

  { area: "admin", method: "GET", path: "/api/admin/summary", auth: "admin", description: "Admin dashboard summary" },
  { area: "admin", method: "GET", path: "/api/admin/users", auth: "admin", description: "List users for moderation" },
  { area: "admin", method: "PATCH", path: "/api/admin/users/:id", auth: "admin", description: "Update a user account" },
  { area: "admin", method: "DELETE", path: "/api/admin/users/:id", auth: "admin", description: "Delete a user account" },
  { area: "admin", method: "GET", path: "/api/admin/quizzes", auth: "admin", description: "List quizzes for admin" },
  { area: "admin", method: "POST", path: "/api/admin/quizzes", auth: "admin", description: "Create a quiz" },
  { area: "admin", method: "PUT", path: "/api/admin/quizzes/:id", auth: "admin", description: "Update a quiz" },
  { area: "admin", method: "DELETE", path: "/api/admin/quizzes/:id", auth: "admin", description: "Delete a quiz" },
  { area: "admin", method: "GET", path: "/api/admin/logs", auth: "admin", description: "Read admin audit logs" },

  { area: "monitoring", method: "POST", path: "/api/monitoring/events", auth: "public", description: "Ingest client-side monitoring events" },
];
