/**
 * User Types - Privacy-First Design
 *
 * Separation of public vs private data:
 * - PublicProfile: Visible to anyone (search results, profile views)
 * - PrivateProfile: Only visible to the account owner
 */

// Public profile - what others can see
// NEVER include: id, email, phone, created_at
export interface PublicProfile {
  username: string;
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
}

// Private profile - only the owner sees this
export interface PrivateProfile extends PublicProfile {
  email: string;
  phone: string | null;
  isDiscoverable: boolean;
  createdAt: Date;
}

// User settings that can be updated
export interface UserSettings {
  displayName?: string;
  bio?: string;
  avatar?: string;
  phone?: string;
  isDiscoverable?: boolean;
}

// Search result - minimal public info
export interface UserSearchResult {
  username: string;
  displayName: string | null;
  avatar: string | null;
}

// Search response with pagination
export interface UserSearchResponse {
  results: UserSearchResult[];
  hasMore: boolean;
}

// Profile update request
export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  avatar?: string;
}

// Settings update request
export interface UpdateSettingsRequest {
  phone?: string;
  isDiscoverable?: boolean;
}

// Username availability check
export interface UsernameCheckResponse {
  available: boolean;
  username: string;
}
