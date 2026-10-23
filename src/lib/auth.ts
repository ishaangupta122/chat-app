import type { AuthUser, AuthResponse } from "@/types/auth";

// Storage keys
const ACCESS_TOKEN_KEY = "access_token";
const USER_KEY = "auth_user";

// --- Storage Helpers ---

export function storeAuthData(response: AuthResponse): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(response.user));
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuthData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// --- Auth State Helpers ---

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function getWsToken(): string | null {
  return getAccessToken();
}
