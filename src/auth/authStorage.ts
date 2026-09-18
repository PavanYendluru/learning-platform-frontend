import type { AuthUser } from "../types/auth.types";

export const AUTH_TOKEN_STORAGE_KEY = "learning-platform.access-token";
const AUTH_USER_STORAGE_KEY = "learning-platform.user";

export function saveSession(token: string, user: AuthUser) {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
}

export function getStoredSession(): { token: string; user: AuthUser } | null {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  const serializedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
  if (!token || !serializedUser || isTokenExpired(token)) return null;

  try {
    const user = JSON.parse(serializedUser) as AuthUser;
    if (!user.name || !user.email || (user.role !== "USER" && user.role !== "ADMIN")) return null;
    return { token, user };
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  // Remove the key written by the Phase 1 API client, if it exists.
  localStorage.removeItem("accessToken");
}

function isTokenExpired(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number };
    return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
