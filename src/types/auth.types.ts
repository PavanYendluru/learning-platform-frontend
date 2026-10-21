export type Role = "USER" | "ADMIN";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: "Bearer";
  userId: number;
  name: string;
  email: string;
  role: Role;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = LoginRequest & {
  name: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
};

export type SendOtpRequest = {
  email: string;
  name?: string;
};

export type VerifyOtpRequest = {
  email: string;
  otp: string;
  purpose: "REGISTRATION" | "PASSWORD_RESET";
};

export type VerifyOtpResponse = {
  verificationToken: string;
  expiresInSeconds: number;
  message: string;
};

export type CompleteRegistrationRequest = {
  name: string;
  email: string;
  password: string;
  verificationToken: string;
};

export type ResetPasswordRequest = {
  email: string;
  newPassword: string;
  resetToken: string;
};
