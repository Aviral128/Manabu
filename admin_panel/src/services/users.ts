import { apiFetch } from "./http";

export type UserProfile = {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  email?: string;
  status?: "active" | "suspended";
  role?: "admin" | "learner";
  points?: number;
  level?: number;
  streak?: number;
  attempts?: number;
  createdAt?: string;
  updatedAt?: string;
};

export async function listAdminUsers(): Promise<UserProfile[]> {
  return apiFetch<UserProfile[]>("/api/proxy/backend/api/admin/users");
}

export async function updateAdminUser(userId: string, payload: Partial<UserProfile>) {
  return apiFetch<{ success: true; user: UserProfile }>(`/api/proxy/backend/api/admin/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: payload,
    retries: 0,
  });
}

export async function deleteAdminUser(userId: string) {
  return apiFetch<{ success: true }>(`/api/proxy/backend/api/admin/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    retries: 0,
  });
}
