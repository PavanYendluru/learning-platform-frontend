import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi } from "../api/authApi";
import { clearSession, getStoredSession, saveSession } from "../auth/authStorage";
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest, Role } from "../types/auth.types";
import { AuthContext, type AuthContextValue, type AuthStatus } from "./auth-context";

function toUser(response: AuthResponse): AuthUser {
  return {
    id: response.userId,
    name: response.name,
    email: response.email,
    role: response.role,
  };
}

function getInitialAuthState(): { status: AuthStatus; user: AuthUser | null } {
  const session = getStoredSession();
  if (session) return { status: "authenticated", user: session.user };
  clearSession();
  return { status: "anonymous", user: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState(getInitialAuthState);
  const { status, user } = authState;

  const logout = useCallback(() => {
    clearSession();
    setAuthState({ status: "anonymous", user: null });
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [logout]);

  useEffect(() => {
    if (status === "authenticated") {
      authApi.getMe().then((res) => {
        if (res.success && res.data) {
          const freshUser: AuthUser = {
            id: res.data.id,
            name: res.data.name,
            email: res.data.email,
            role: res.data.role as Role,
          };
          const session = getStoredSession();
          if (session) {
            saveSession(session.token, freshUser);
          }
          setAuthState({ status: "authenticated", user: freshUser });
        }
      }).catch(() => {
        // Silently preserve existing stored session if offline
      });
    }
  }, [status]);

  const completeAuthentication = useCallback((response: AuthResponse) => {
    const authenticatedUser = toUser(response);
    saveSession(response.accessToken, authenticatedUser);
    setAuthState({ status: "authenticated", user: authenticatedUser });
    return authenticatedUser;
  }, []);

  const updateProfile = useCallback(async (name: string) => {
    const res = await authApi.updateProfile(name);
    if (res.success && res.data) {
      const updatedUser: AuthUser = {
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role as Role,
      };
      const session = getStoredSession();
      if (session) {
        saveSession(session.token, updatedUser);
      }
      setAuthState((prev) => ({ ...prev, user: updatedUser }));
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAuthenticated: status === "authenticated",
      updateProfile,

      login: async (request: LoginRequest, expectedRole: Role) => {
        const response = (await authApi.login(request)).data;

        // Strict portal check — wrong role = invalid for this form
        if (response.role !== expectedRole) {
          clearSession();
          throw new Error(
            expectedRole === "ADMIN"
              ? "Invalid credentials for Admin login."
              : "Invalid credentials for User login."
          );
        }

        return completeAuthentication(response);
      },

      register: async (request: RegisterRequest) => {
        const response = (await authApi.register(request)).data;
        // Register is USER-only; if backend ever returns ADMIN, reject
        if (response.role !== "USER") {
          clearSession();
          throw new Error("Registration is only available for User accounts.");
        }
        return completeAuthentication(response);
      },

      logout,
    }),
    [completeAuthentication, logout, status, user, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}