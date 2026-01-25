import { NextRequest, NextResponse } from "next/server";
import {
  getPrivateProfile,
  updateProfile,
  updateSettings,
} from "@/server/services/user.service";
import {
  updateProfileSchema,
  updateSettingsSchema,
} from "@/schemas/user.schema";
import { rateLimitAction } from "@/server/utils/rateLimiter";
import { getAuthContext, unauthorizedResponse } from "@/server/auth/middleware";
import type { PrivateProfile } from "@/types/user";

/**
 * GET /api/users/me
 *
 * Get the authenticated user's private profile
 * Includes all private fields (email, phone, etc.)
 *
 * Requires authentication
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<PrivateProfile | { error: string }>> {
  const authContext = await getAuthContext(request);

  if (!authContext) {
    return unauthorizedResponse();
  }

  try {
    const profile = await getPrivateProfile(authContext.userId);

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching profile" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/me
 *
 * Update the authenticated user's profile (public fields)
 *
 * Body:
 * - displayName?: string (max 100 chars)
 * - bio?: string (max 500 chars)
 * - avatar?: string (URL)
 *
 * Requires authentication
 */
export async function PATCH(
  request: NextRequest
): Promise<NextResponse<PrivateProfile | { error: string }>> {
  const authContext = await getAuthContext(request);

  if (!authContext) {
    return unauthorizedResponse();
  }

  // Rate limit
  const rateLimitResult = rateLimitAction("settingsUpdate", authContext.userId);

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

  try {
    const body = await request.json();

    // Validate with Zod
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      const error = result.error.issues[0];
      return NextResponse.json(
        { error: error?.message || "Invalid input" },
        { status: 400 }
      );
    }

    // Update profile
    const updatedProfile = await updateProfile(authContext.userId, result.data);

    if (!updatedProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating profile" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/me
 *
 * Update the authenticated user's settings (private fields)
 *
 * Body:
 * - phone?: string (optional, for 2FA/recovery)
 * - isDiscoverable?: boolean (opt-out of search)
 *
 * Requires authentication
 */
export async function PUT(
  request: NextRequest
): Promise<NextResponse<PrivateProfile | { error: string }>> {
  const authContext = await getAuthContext(request);

  if (!authContext) {
    return unauthorizedResponse();
  }

  // Rate limit
  const rateLimitResult = rateLimitAction("settingsUpdate", authContext.userId);

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

  try {
    const body = await request.json();

    // Validate with Zod
    const result = updateSettingsSchema.safeParse(body);

    if (!result.success) {
      const error = result.error.issues[0];
      return NextResponse.json(
        { error: error?.message || "Invalid input" },
        { status: 400 }
      );
    }

    // Update settings
    const updatedProfile = await updateSettings(
      authContext.userId,
      result.data
    );

    if (!updatedProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating settings" },
      { status: 500 }
    );
  }
}
