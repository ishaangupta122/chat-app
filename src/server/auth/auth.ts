import "server-only";
import { db } from "@/server/db";
import { generateId } from "@/server/utils/ids";
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from "./password";
import { signAccessToken } from "./jwt";
import { verifyGoogleToken } from "./google";
import type {
  AuthUser,
  AuthResponse,
  EmailSignupRequest,
  EmailLoginRequest,
  GoogleAuthRequest,
  AuthProvider,
} from "@/types/auth";
import type { UserRow } from "@/server/db/schema";

// Error types for auth operations
export class AuthError extends Error {
  constructor(
    message: string,
    public code:
      | "INVALID_CREDENTIALS"
      | "EMAIL_EXISTS"
      | "INVALID_TOKEN"
      | "WEAK_PASSWORD"
      | "PROVIDER_ERROR"
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Convert database row to AuthUser
 */
function rowToAuthUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatar: row.avatar,
    provider: row.provider as AuthProvider,
    providerId: row.provider_id,
    createdAt: row.created_at,
  };
}

/**
 * Signup with email and password
 */
export async function signupWithEmail(
  request: EmailSignupRequest
): Promise<AuthResponse> {
  const { email, password, name } = request;

  // Validate password strength
  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    throw new AuthError(passwordError, "WEAK_PASSWORD");
  }

  // Check if email already exists
  const existing = await db.query(`SELECT id FROM users WHERE email = $1`, [
    email.toLowerCase(),
  ]);

  if (existing.rows.length > 0) {
    throw new AuthError(
      "Unable to create account. Please try again.",
      "EMAIL_EXISTS"
    );
  }

  // Hash password and create user
  const passwordHash = await hashPassword(password);
  const userId = generateId();

  const result = await db.query<UserRow>(
    `INSERT INTO users (id, email, name, password_hash, provider)
     VALUES ($1, $2, $3, $4, 'email')
     RETURNING *`,
    [userId, email.toLowerCase(), name, passwordHash]
  );

  const user = rowToAuthUser(result.rows[0]);

  // Generate access token
  const accessToken = await signAccessToken({
    userId: user.id,
    email: user.email,
  });

  return { user, accessToken };
}

/**
 * Login with email and password
 */
export async function loginWithEmail(
  request: EmailLoginRequest
): Promise<AuthResponse> {
  const { email, password } = request;

  // Find user by email
  const result = await db.query<UserRow>(
    `SELECT * FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    throw new AuthError("Invalid email or password", "INVALID_CREDENTIALS");
  }

  const row = result.rows[0];

  // Check if user has a password (email provider)
  if (!row.password_hash) {
    throw new AuthError(
      "This account uses Google sign-in. Please login with Google.",
      "INVALID_CREDENTIALS"
    );
  }

  // Verify password
  const isValid = await verifyPassword(password, row.password_hash);
  if (!isValid) {
    throw new AuthError("Invalid email or password", "INVALID_CREDENTIALS");
  }

  const user = rowToAuthUser(row);

  // Generate access token
  const accessToken = await signAccessToken({
    userId: user.id,
    email: user.email,
  });

  return { user, accessToken };
}

/**
 * Login/Signup with Google OAuth
 */
export async function loginWithGoogle(
  request: GoogleAuthRequest
): Promise<AuthResponse> {
  const { googleToken } = request;

  // Verify Google ID token
  const googlePayload = await verifyGoogleToken(googleToken);
  if (!googlePayload) {
    throw new AuthError("Invalid Google token", "PROVIDER_ERROR");
  }

  if (!googlePayload.email_verified) {
    throw new AuthError("Google email not verified", "PROVIDER_ERROR");
  }

  // Check if user exists with this Google ID
  let result = await db.query<UserRow>(
    `SELECT * FROM users WHERE provider = 'google' AND provider_id = $1`,
    [googlePayload.sub]
  );

  let user: AuthUser;

  if (result.rows.length === 0) {
    // Check if email exists with different provider
    const emailCheck = await db.query<UserRow>(
      `SELECT * FROM users WHERE email = $1`,
      [googlePayload.email.toLowerCase()]
    );

    if (emailCheck.rows.length > 0) {
      // Link Google to existing email account (update provider)
      result = await db.query<UserRow>(
        `UPDATE users 
         SET provider = 'google', provider_id = $1, avatar = COALESCE(avatar, $2), updated_at = NOW()
         WHERE email = $3
         RETURNING *`,
        [
          googlePayload.sub,
          googlePayload.picture,
          googlePayload.email.toLowerCase(),
        ]
      );
      user = rowToAuthUser(result.rows[0]);
    } else {
      // Create new user
      const userId = generateId();
      result = await db.query<UserRow>(
        `INSERT INTO users (id, email, name, avatar, provider, provider_id)
         VALUES ($1, $2, $3, $4, 'google', $5)
         RETURNING *`,
        [
          userId,
          googlePayload.email.toLowerCase(),
          googlePayload.name,
          googlePayload.picture,
          googlePayload.sub,
        ]
      );
      user = rowToAuthUser(result.rows[0]);
    }
  } else {
    user = rowToAuthUser(result.rows[0]);
  }

  // Generate access token
  const accessToken = await signAccessToken({
    userId: user.id,
    email: user.email,
  });

  return { user, accessToken };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<AuthUser | null> {
  const result = await db.query<UserRow>(`SELECT * FROM users WHERE id = $1`, [
    userId,
  ]);

  if (result.rows.length === 0) {
    return null;
  }

  return rowToAuthUser(result.rows[0]);
}
