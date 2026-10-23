import { NextRequest, NextResponse } from "next/server";
import { getPublicProfile } from "@/server/services/user.service";
import { rateLimitAction } from "@/server/utils/rateLimiter";
import { getAuthContext } from "@/server/auth/middleware";
import type { PublicProfile } from "@/types/user";

/**
 * GET /api/users/profile/[username]
 *
 * Get a user's public profile by username
 *
 * Returns only public fields:
 * - username
 * - displayName
 * - avatar
 * - bio
 *
 * Privacy guarantees:
 * - NEVER returns: id, email, phone, created_at
 * - Available to anyone (authenticated or not)
 *
 * Rate limited: 30 requests/minute per user/IP
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
): Promise<NextResponse<PublicProfile | { error: string }>> {
  const { username } = await params;

  // Get identifier for rate limiting
  const authContext = await getAuthContext(request);
  const identifier =
    authContext?.userId ||
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "anonymous";

  // Check rate limit
  const rateLimitResult = rateLimitAction("profileView", identifier);

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

  if (!username || typeof username !== "string") {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  try {
    const profile = await getPublicProfile(username);

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(profile, {
      headers: {
        "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        "X-RateLimit-Reset": String(rateLimitResult.resetAt),
        // Cache public profiles for 5 minutes
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Get public profile error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching profile" },
      { status: 500 }
    );
  }
}
