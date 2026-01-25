import { NextRequest, NextResponse } from "next/server";
import { isUsernameAvailable } from "@/server/services/user.service";
import { usernameSchema } from "@/schemas/user.schema";
import { rateLimitAction } from "@/server/utils/rateLimiter";
import type { UsernameCheckResponse } from "@/types/user";

/**
 * GET /api/users/check-username
 *
 * Check if a username is available
 *
 * Query params:
 * - username: Username to check (3-20 chars, alphanumeric + underscore)
 *
 * Rate limited: 20 requests/minute per IP
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<UsernameCheckResponse | { error: string }>> {
  // Get identifier for rate limiting
  const identifier =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "anonymous";

  // Check rate limit
  const rateLimitResult = rateLimitAction("usernameCheck", identifier);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.retryAfter || 60),
        },
      }
    );
  }

  // Parse query params
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username") || "";

  // Validate with Zod
  const result = usernameSchema.safeParse(username);

  if (!result.success) {
    const error = result.error.issues[0];
    return NextResponse.json(
      { error: error?.message || "Invalid username" },
      { status: 400 }
    );
  }

  try {
    const available = await isUsernameAvailable(result.data);

    return NextResponse.json({
      available,
      username: result.data,
    });
  } catch (error) {
    console.error("Username check error:", error);
    return NextResponse.json(
      { error: "An error occurred while checking username" },
      { status: 500 }
    );
  }
}
