import "server-only";
import prisma from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from "./password";
import { signAccessToken } from "./jwt";
import { verifyGoogleToken } from "./google";
import type { AuthUser, AuthResponse, AuthProvider } from "@/types/auth";
import type {
  SignupInput,
  LoginInput,
  GoogleAuthInput,
} from "@/schemas/auth.schema";

// Full user type from Prisma query
type FullUser = {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  avatar: string | null;
  provider: AuthProvider;
  providerId: string | null;
  createdAt: Date;
  passwordHash: string | null;
};

// Error types for auth operations
export class AuthError extends Error {
  constructor(
    message: string,
    public code:
      | "INVALID_CREDENTIALS"
      | "EMAIL_EXISTS"
      | "USERNAME_EXISTS"
      | "INVALID_TOKEN"
      | "WEAK_PASSWORD"
      | "PROVIDER_ERROR"
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Convert Prisma user to AuthUser
 */
function toAuthUser(user: FullUser): AuthUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    avatar: user.avatar,
    provider: user.provider,
    providerId: user.providerId,
    createdAt: user.createdAt,
  };
}

/**
 * Signup with email and password
 */
export async function signupWithEmail(
  input: SignupInput
): Promise<AuthResponse> {
  const { email, password, username, displayName } = input;

  // Validate password strength
  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    throw new AuthError(passwordError, "WEAK_PASSWORD");
  }

  // Check if email already exists
  const existingEmail = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingEmail) {
    throw new AuthError(
      "Unable to create account. Please try again.",
      "EMAIL_EXISTS"
    );
  }

  // Check if username already exists
  const existingUsername = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (existingUsername) {
    throw new AuthError("This username is already taken.", "USERNAME_EXISTS");
  }

  // Hash password and create user
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      displayName: displayName || null,
      passwordHash,
      provider: "email",
    },
  });

  const authUser = toAuthUser(user);

  // Generate access token
  const accessToken = await signAccessToken({
    userId: user.id,
    email: user.email,
  });

  return { user: authUser, accessToken };
}

/**
 * Login with email and password
 */
export async function loginWithEmail(input: LoginInput): Promise<AuthResponse> {
  const { email, password } = input;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AuthError("Invalid email or password", "INVALID_CREDENTIALS");
  }

  // Check if user has a password (email provider)
  if (!user.passwordHash) {
    throw new AuthError(
      "This account uses Google sign-in. Please login with Google.",
      "INVALID_CREDENTIALS"
    );
  }

  // Verify password
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new AuthError("Invalid email or password", "INVALID_CREDENTIALS");
  }

  const authUser = toAuthUser(user);

  // Generate access token
  const accessToken = await signAccessToken({
    userId: user.id,
    email: user.email,
  });

  return { user: authUser, accessToken };
}

/**
 * Login/Signup with Google OAuth
 */
export async function loginWithGoogle(
  input: GoogleAuthInput
): Promise<AuthResponse> {
  const { googleToken } = input;

  // Verify Google ID token
  const googlePayload = await verifyGoogleToken(googleToken);
  if (!googlePayload) {
    throw new AuthError("Invalid Google token", "PROVIDER_ERROR");
  }

  if (!googlePayload.email_verified) {
    throw new AuthError("Google email not verified", "PROVIDER_ERROR");
  }

  // Check if user exists with this Google ID
  let user = await prisma.user.findFirst({
    where: {
      provider: "google",
      providerId: googlePayload.sub,
    },
  });

  if (!user) {
    // Check if email exists with different provider
    const existingUser = await prisma.user.findUnique({
      where: { email: googlePayload.email.toLowerCase() },
    });

    if (existingUser) {
      // Link Google to existing email account (update provider)
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          provider: "google",
          providerId: googlePayload.sub,
          avatar: existingUser.avatar || googlePayload.picture,
        },
      });
    } else {
      // Create new user - generate username from email
      const baseUsername = googlePayload.email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .substring(0, 15);

      // Ensure unique username
      let username = baseUsername;
      let counter = 1;
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      user = await prisma.user.create({
        data: {
          email: googlePayload.email.toLowerCase(),
          username,
          displayName: googlePayload.name,
          avatar: googlePayload.picture,
          provider: "google",
          providerId: googlePayload.sub,
        },
      });
    }
  }

  const authUser = toAuthUser(user);

  // Generate access token
  const accessToken = await signAccessToken({
    userId: user.id,
    email: user.email,
  });

  return { user: authUser, accessToken };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  return toAuthUser(user);
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return null;
  }

  return toAuthUser(user);
}
