import { NextRequest, NextResponse } from "next/server";
import { searchByUsername } from "@/server/services/user.service";
import { searchUsersSchema } from "@/schemas/user.schema";
import { rateLimitAction } from "@/server/utils/rateLimiter";
import { getAuthContext } from "@/server/auth/middleware";
import type { UserSearchResponse } from "@/types/user";

/**
 * GET /api/users/search
 *
 * Search users by username (exact or prefix match)
 *
 * Query params:
 * - q: Search query (3-20 chars, alphanumeric + underscore)
 * - limit: Max results (default 10, max 20)
 *
 * Rate limited: 10 requests/minute per user
 *
 * Response: { results: UserSearchResult[], hasMore: boolean }
 *
 * Privacy guarantees:
 * - Only searches by username (never email/phone)
 * - Only returns public profile fields
 * - Respects is_discoverable setting
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<UserSearchResponse | { error: string }>> {
  // Get auth context for rate limiting (use IP if not authenticated)
  const authContext = await getAuthContext(request);
  const identifier =
    authContext?.userId ||
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "anonymous";

  // Check rate limit
  const rateLimitResult = rateLimitAction("userSearch", identifier);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.retryAfter || 60),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateLimitResult.resetAt),
        },
      }
    );
  }

  // Parse query params
  const searchParams = request.nextUrl.searchParams;
  const queryParams = {
    q: searchParams.get("q") || "",
    limit: searchParams.get("limit") || undefined,
  };

  // Validate with Zod
  const result = searchUsersSchema.safeParse(queryParams);

  if (!result.success) {
    const error = result.error.issues[0];
    return NextResponse.json(
      { error: error?.message || "Invalid search query" },
      { status: 400 }
    );
  }

  try {
    // Search users (excludes current user if authenticated)
    const results = await searchByUsername(
      result.data.q,
      result.data.limit,
      authContext?.userId
    );

    return NextResponse.json(results, {
      headers: {
        "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        "X-RateLimit-Reset": String(rateLimitResult.resetAt),
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "An error occurred while searching" },
      { status: 500 }
    );
  }
}
