import { apiClient } from "../../core/api/client";

export type LoginPayload = {
  email: string;
  password: string;
};

export async function login(payload: LoginPayload) {
  const response = await apiClient.post("/v1/auth/login", payload);
  return response.data as {
    accessToken: string;
    refreshToken: string;
    expiresInSeconds: number;
  };
}
