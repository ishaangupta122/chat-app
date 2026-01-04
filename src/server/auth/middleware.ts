import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "./jwt";
import type { AuthContext } from "@/types/auth";

/**
 * Extract bearer token from Authorization header
 */
function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Verify auth and return context
 * Returns null if authentication fails
 */
export async function getAuthContext(
  request: NextRequest
): Promise<AuthContext | null> {
  const token = extractBearerToken(request);
  if (!token) {
    return null;
  }

  const payload = await verifyAccessToken(token);
  if (!payload) {
    return null;
  }

  return {
    userId: payload.userId,
    email: payload.email,
  };
}

/**
 * Authentication error response
 */
export function unauthorizedResponse(
  message = "Unauthorized"
): NextResponse<{ error: string }> {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Higher-order function to protect API routes
 * Wraps a handler and ensures authentication before execution
 */
export function withAuth<T>(
  handler: (
    request: NextRequest,
    context: AuthContext
  ) => Promise<NextResponse<T>>
): (request: NextRequest) => Promise<NextResponse<T | { error: string }>> {
  return async (
    request: NextRequest
  ): Promise<NextResponse<T | { error: string }>> => {
    const authContext = await getAuthContext(request);

    if (!authContext) {
      return unauthorizedResponse();
    }

    return handler(request, authContext);
  };
}

/**
 * Type guard to check if response is an error response
 */
export function isErrorResponse(
  response: unknown
): response is { error: string } {
  return (
    typeof response === "object" && response !== null && "error" in response
  );
}
