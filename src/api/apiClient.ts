
import { AUTH_TOKEN_STORAGE_KEY } from "../auth/authStorage";

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  if (!baseUrl) {
    throw new Error("VITE_API_BASE_URL is not configured");
  }

  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string } | null;
    if (response.status === 401) window.dispatchEvent(new Event("auth:unauthorized"));
    throw new ApiError(response.status, body?.message ?? `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}
