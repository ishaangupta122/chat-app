import "server-only";
import prisma from "@/lib/prisma";
import type {
  PublicProfile,
  PrivateProfile,
  UserSearchResponse,
} from "@/types/user";
import type {
  UpdateProfileInput,
  UpdateSettingsInput,
} from "@/schemas/user.schema";

/**
 * User Service - Privacy-First Design with Prisma
 *
 * Key principles:
 * - Never expose internal IDs in public responses
 * - Never search by email or phone
 * - Only search by username (the public identifier)
 * - Separate public vs private profile methods
 */

const DEFAULT_SEARCH_LIMIT = 10;
const MAX_SEARCH_LIMIT = 20;

// Type for user with public fields only
type PublicUser = {
  username: string;
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
};

// Type for user with private fields
type PrivateUser = PublicUser & {
  email: string;
  phone: string | null;
  isDiscoverable: boolean;
  createdAt: Date;
};

// Type for search result
type SearchResultUser = {
  username: string;
  displayName: string | null;
  avatar: string | null;
};

// Select only public fields - NEVER include id, email, phone
const publicProfileSelect = {
  username: true,
  displayName: true,
  avatar: true,
  bio: true,
};

// Select fields for private profile (owner only)
const privateProfileSelect = {
  username: true,
  displayName: true,
  avatar: true,
  bio: true,
  email: true,
  phone: true,
  isDiscoverable: true,
  createdAt: true,
};

// Select minimal fields for search results
const searchResultSelect = {
  username: true,
  displayName: true,
  avatar: true,
};

/**
 * Convert Prisma user to public profile
 */
function toPublicProfile(user: PublicUser): PublicProfile {
  return {
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar,
    bio: user.bio,
  };
}

/**
 * Convert Prisma user to private profile
 */
function toPrivateProfile(user: PrivateUser): PrivateProfile {
  return {
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar,
    bio: user.bio,
    email: user.email,
    phone: user.phone,
    isDiscoverable: user.isDiscoverable,
    createdAt: user.createdAt,
  };
}

/**
 * Search users by username (exact or prefix match)
 * - Only searches discoverable users
 * - Case insensitive
 * - Returns public profile fields only
 */
export async function searchByUsername(
  query: string,
  limit: number = DEFAULT_SEARCH_LIMIT,
  excludeUserId?: string
): Promise<UserSearchResponse> {
  const safeLimit = Math.min(limit, MAX_SEARCH_LIMIT);
  const normalizedQuery = query.toLowerCase();

  // Find users with username starting with query
  const users = await prisma.user.findMany({
    where: {
      username: {
        startsWith: normalizedQuery,
        mode: "insensitive",
      },
      isDiscoverable: true,
      ...(excludeUserId && { id: { not: excludeUserId } }),
    },
    select: searchResultSelect,
    orderBy: [
      // Exact matches first
      { username: "asc" },
    ],
    take: safeLimit + 1, // Fetch one extra to check if there are more
  });

  const hasMore = users.length > safeLimit;
  const results = hasMore ? users.slice(0, safeLimit) : users;

  return {
    results: results.map((user) => ({
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
    })),
    hasMore,
  };
}

/**
 * Get public profile by username
 * Anyone can view this
 */
export async function getPublicProfile(
  username: string
): Promise<PublicProfile | null> {
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: publicProfileSelect,
  });

  if (!user) {
    return null;
  }

  return toPublicProfile(user);
}

/**
 * Get private profile by user ID
 * Only the account owner can view this
 */
export async function getPrivateProfile(
  userId: string
): Promise<PrivateProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: privateProfileSelect,
  });

  if (!user) {
    return null;
  }

  return toPrivateProfile(user);
}

/**
 * Update user profile (public fields)
 */
export async function updateProfile(
  userId: string,
  updates: UpdateProfileInput
): Promise<PrivateProfile | null> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: updates.displayName,
        bio: updates.bio,
        avatar: updates.avatar,
      },
      select: privateProfileSelect,
    });

    return toPrivateProfile(user);
  } catch {
    return null;
  }
}

/**
 * Update user settings (private fields)
 */
export async function updateSettings(
  userId: string,
  updates: UpdateSettingsInput
): Promise<PrivateProfile | null> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        phone: updates.phone,
        isDiscoverable: updates.isDiscoverable,
      },
      select: privateProfileSelect,
    });

    return toPrivateProfile(user);
  } catch {
    return null;
  }
}

/**
 * Check if username is available
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true },
  });

  return user === null;
}

/**
 * Get user ID by username (internal use only)
 * Used for friend requests, etc.
 */
export async function getUserIdByUsername(
  username: string
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true },
  });

  return user?.id ?? null;
}

/**
 * Get username by user ID (internal use)
 */
export async function getUsernameById(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });

  return user?.username ?? null;
}

/**
 * Check if user exists by ID
 */
export async function userExists(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  return user !== null;
}
