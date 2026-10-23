import { NextRequest, NextResponse } from "next/server";
import {
  signupWithEmail,
  loginWithEmail,
  loginWithGoogle,
  getUserById,
} from "@/server/auth";
import { getAuthContext } from "@/server/auth/middleware";
import { setAuthCookie, clearAuthCookie } from "@/server/auth/session";
import {
  signupSchema,
  loginSchema,
  googleAuthSchema,
} from "@/schemas/auth.schema";
import type { AuthResponse } from "@/types/auth";

/**
 * POST /api/auth
 * Unified auth endpoint with action-based routing
 *
 * Actions:
 * - signup: Email + password signup (with username)
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
        return handleSignup(data);

      case "login":
        return handleLogin(data);

      case "google":
        return handleGoogleAuth(data);

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
      const statusCode =
        err.code === "EMAIL_EXISTS" || err.code === "USERNAME_EXISTS"
          ? 409
          : 401;
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
 * Handle email signup with Zod validation
 */
async function handleSignup(
  data: unknown
): Promise<NextResponse<AuthResponse | { error: string }>> {
  // Validate with Zod
  const result = signupSchema.safeParse(data);

  if (!result.success) {
    const error = result.error.issues[0];
    return NextResponse.json(
      { error: error?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const authResult = await signupWithEmail(result.data);

  // Set cookie
  await setAuthCookie(authResult.accessToken);

  return NextResponse.json(authResult);
}

/**
 * Handle email login with Zod validation
 */
async function handleLogin(
  data: unknown
): Promise<NextResponse<AuthResponse | { error: string }>> {
  // Validate with Zod
  const result = loginSchema.safeParse(data);

  if (!result.success) {
    const error = result.error.issues[0];
    return NextResponse.json(
      { error: error?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const authResult = await loginWithEmail(result.data);

  // Set cookie
  await setAuthCookie(authResult.accessToken);

  return NextResponse.json(authResult);
}

/**
 * Handle Google OAuth with Zod validation
 */
async function handleGoogleAuth(
  data: unknown
): Promise<NextResponse<AuthResponse | { error: string }>> {
  // Validate with Zod
  const result = googleAuthSchema.safeParse(data);

  if (!result.success) {
    const error = result.error.issues[0];
    return NextResponse.json(
      { error: error?.message || "Invalid input" },
      { status: 400 }
    );
  }

  try {
    const authResult = await loginWithGoogle(result.data);

    // Set cookie
    await setAuthCookie(authResult.accessToken);

    return NextResponse.json(authResult);
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

  const user = await getUserById(authContext.userId);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}
