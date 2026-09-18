import { apiClient } from "./apiClient";
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from "../types/auth.types";

export const authApi = {
  login: (request: LoginRequest) =>
    apiClient<ApiResponse<AuthResponse>>("/auth/login", {
      method: "POST",
      body: JSON.stringify(request),
    }),
  register: (request: RegisterRequest) =>
    apiClient<ApiResponse<AuthResponse>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(request),
    }),
  updateProfile: (name: string) =>
    apiClient<ApiResponse<{ id: number; name: string; email: string; role: string }>>("/users/me", {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),
  getMe: () =>
    apiClient<ApiResponse<{ id: number; name: string; email: string; role: string }>>("/users/me", {
      method: "GET",
    }),
};
