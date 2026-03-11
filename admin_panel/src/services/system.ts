import { apiFetch } from "./http";

export type HealthResponse = { service: string; status: string; timestamp?: string };

export type ServiceKey =
  | "gateway"
  | "auth"
  | "user"
  | "quiz"
  | "learning"
  | "gamification"
  | "social"
  | "analytics"
  | "content"
  | "notifications"
  | "sync"
  | "recommendations"
  | "ai";

export const SERVICES: Array<{ key: ServiceKey; label: string }> = [
  { key: "gateway", label: "API Gateway" },
  { key: "auth", label: "Auth Service" },
  { key: "user", label: "User Service" },
  { key: "quiz", label: "Quiz Service" },
  { key: "learning", label: "Learning Service" },
  { key: "gamification", label: "Gamification Service" },
  { key: "social", label: "Social Service" },
  { key: "analytics", label: "Analytics Service" },
  { key: "content", label: "Content Service" },
  { key: "notifications", label: "Notification Service" },
  { key: "sync", label: "Sync Service" },
  { key: "recommendations", label: "Recommendation Service" },
  { key: "ai", label: "AI Engine" },
];

export async function healthCheck(service: ServiceKey): Promise<HealthResponse> {
  return apiFetch<HealthResponse>(`/api/proxy/${service}/health`);
}

