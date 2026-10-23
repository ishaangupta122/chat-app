// Auth Provider Types (matches Prisma enum)
export type AuthProvider = "email" | "google";

// JWT Payload - Single source of truth for user identity
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// User data for auth operations
// Note: This is for internal auth use, includes some private fields
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  avatar: string | null;
  provider: AuthProvider;
  providerId: string | null;
  createdAt: Date;
}

// Signup request types
export interface EmailSignupRequest {
  email: string;
  password: string;
  username: string;
  displayName?: string;
}

export interface GoogleAuthRequest {
  googleToken: string; // ID token from Google OAuth
}

// Login request types
export interface EmailLoginRequest {
  email: string;
  password: string;
}

// Auth response
export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

// API Route authenticated request context
export interface AuthContext {
  userId: string;
  email: string;
}

// Google OAuth token payload (from ID token)
export interface GoogleTokenPayload {
  sub: string; // Google user ID
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
}
