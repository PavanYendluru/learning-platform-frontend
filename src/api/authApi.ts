import { apiClient } from "./apiClient";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  SendOtpRequest,
  VerifyOtpRequest,
  VerifyOtpResponse,
  CompleteRegistrationRequest,
  ResetPasswordRequest,
} from "../types/auth.types";

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

  // Registration with OTP
  sendRegistrationOtp: (request: SendOtpRequest) =>
    apiClient<ApiResponse<void>>("/auth/register/send-otp", {
      method: "POST",
      body: JSON.stringify(request),
    }),

  verifyRegistrationOtp: (request: VerifyOtpRequest) =>
    apiClient<ApiResponse<VerifyOtpResponse>>("/auth/register/verify-otp", {
      method: "POST",
      body: JSON.stringify(request),
    }),

  completeRegistration: (request: CompleteRegistrationRequest) =>
    apiClient<ApiResponse<AuthResponse>>("/auth/register/complete", {
      method: "POST",
      body: JSON.stringify(request),
    }),

  // Forgot Password with OTP
  sendPasswordResetOtp: (request: SendOtpRequest) =>
    apiClient<ApiResponse<void>>("/auth/forgot-password/send-otp", {
      method: "POST",
      body: JSON.stringify(request),
    }),

  verifyPasswordResetOtp: (request: VerifyOtpRequest) =>
    apiClient<ApiResponse<VerifyOtpResponse>>("/auth/forgot-password/verify-otp", {
      method: "POST",
      body: JSON.stringify(request),
    }),

  resetPassword: (request: ResetPasswordRequest) =>
    apiClient<ApiResponse<void>>("/auth/forgot-password/reset", {
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
