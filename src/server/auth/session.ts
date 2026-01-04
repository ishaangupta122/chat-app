import "server-only";
import { cookies } from "next/headers";
import { verifyAccessToken } from "./jwt";
import type { AuthContext } from "@/types/auth";

// Cookie name
const ACCESS_TOKEN_COOKIE = "access_token";

// Cookie options for security
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/**
 * Set auth cookie after login/signup
 */
export async function setAuthCookie(accessToken: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

/**
 * Clear auth cookie on logout
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
}

/**
 * Get access token from cookies
 */
export async function getAccessTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

/**
 * Get current session from cookies (for server components)
 */
export async function getSession(): Promise<AuthContext | null> {
  const accessToken = await getAccessTokenFromCookies();
  if (!accessToken) {
    return null;
  }

  const payload = await verifyAccessToken(accessToken);
  if (!payload) {
    return null;
  }

  return {
    userId: payload.userId,
    email: payload.email,
  };
}
