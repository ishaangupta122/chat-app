import { NextRequest, NextResponse } from "next/server";
import {
  signupWithEmail,
  loginWithEmail,
  loginWithGoogle,
  AuthError,
  getAuthContext,
} from "@/server/auth";
import { setAuthCookie, clearAuthCookie } from "@/server/auth/session";
import type {
  EmailSignupRequest,
  EmailLoginRequest,
  GoogleAuthRequest,
  AuthResponse,
} from "@/types/auth";

/**
 * POST /api/auth
 * Unified auth endpoint with action-based routing
 *
 * Actions:
 * - signup: Email + password signup
 * - login: Email + password login
 * - google: Google OAuth login/signup
 * - logout: Logout (clear cookie)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { action, ...data } = body as { action: string } & Record<
      string,
      unknown
    >;

    switch (action) {
      case "signup":
        return handleSignup(data as unknown as EmailSignupRequest);

      case "login":
        return handleLogin(data as unknown as EmailLoginRequest);

      case "google":
        return handleGoogleAuth(data as unknown as GoogleAuthRequest);

      case "logout":
        return handleLogout();

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error("Auth error:", error);

    // Check if error has code property (AuthError)
    const err = error as { message?: string; code?: string };

    if (err.code) {
      const statusCode = err.code === "EMAIL_EXISTS" ? 409 : 401;
      return NextResponse.json(
        { error: err.message || "Authentication failed", code: err.code },
        { status: statusCode }
      );
    }

    // For other errors
    const message = err.message || "Something went wrong. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Handle email signup
 */
async function handleSignup(
  data: EmailSignupRequest
): Promise<NextResponse<AuthResponse | { error: string }>> {
  if (!data.email || !data.password || !data.name) {
    return NextResponse.json(
      { error: "Email, password, and name are required" },
      { status: 400 }
    );
  }

  const result = await signupWithEmail(data);

  // Set cookie
  await setAuthCookie(result.accessToken);

  return NextResponse.json(result);
}

/**
 * Handle email login
 */
async function handleLogin(
  data: EmailLoginRequest
): Promise<NextResponse<AuthResponse | { error: string }>> {
  if (!data.email || !data.password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const result = await loginWithEmail(data);

  // Set cookie
  await setAuthCookie(result.accessToken);

  return NextResponse.json(result);
}

/**
 * Handle Google OAuth
 */
async function handleGoogleAuth(
  data: GoogleAuthRequest
): Promise<NextResponse<AuthResponse | { error: string }>> {
  if (!data.googleToken) {
    return NextResponse.json(
      { error: "Google token is required" },
      { status: 400 }
    );
  }

  try {
    const result = await loginWithGoogle(data);

    // Set cookie
    await setAuthCookie(result.accessToken);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Google auth error:", error);
    const err = error as { message?: string; code?: string };

    if (err.code) {
      return NextResponse.json(
        {
          error: err.message || "Google authentication failed",
          code: err.code,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: err.message || "Google authentication failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle logout
 */
async function handleLogout(): Promise<NextResponse<{ success: boolean }>> {
  // Clear cookie
  await clearAuthCookie();

  return NextResponse.json({ success: true });
}

/**
 * GET /api/auth
 * Get current authenticated user
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authContext = await getAuthContext(request);

  if (!authContext) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Import here to avoid circular dependency
  const { getUserById } = await import("@/server/auth");
  const user = await getUserById(authContext.userId);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}
