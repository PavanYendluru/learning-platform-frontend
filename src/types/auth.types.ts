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
