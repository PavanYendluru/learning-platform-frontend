import { createContext } from "react";
import type { AuthUser, LoginRequest, RegisterRequest, Role } from "../types/auth.types";

export type AuthStatus = "restoring" | "authenticated" | "anonymous";

export type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** expectedRole: selected portal. Mismatch → error, no session. */
  login: (request: LoginRequest, expectedRole: Role) => Promise<AuthUser>;
  register: (request: RegisterRequest) => Promise<AuthUser>;
  logout: () => void;
  updateProfile: (name: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);