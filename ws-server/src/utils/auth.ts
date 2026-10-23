import { jwtVerify } from "jose";

// JWT Payload type (matching main app)
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Get JWT secret from environment
const getJwtSecret = (): Uint8Array => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return new TextEncoder().encode(secret);
};

/**
 * Verify an access token
 * This uses the same secret as the main Next.js app
 */
export async function verifyAccessToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

/**
 * Extract token from connection request
 * Supports: query param (?token=xxx) or auth header
 */
export function extractToken(handshake: {
  query: Record<string, unknown>;
  headers: Record<string, string | string[] | undefined>;
}): string | null {
  // Try query param first
  const queryToken = handshake.query.token;
  if (typeof queryToken === "string" && queryToken) {
    return queryToken;
  }

  // Try Authorization header
  const authHeader = handshake.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
}

/**
 * Authenticate a WebSocket connection during handshake
 * Returns user payload if valid, null otherwise
 */
export async function authenticateConnection(handshake: {
  query: Record<string, unknown>;
  headers: Record<string, string | string[] | undefined>;
}): Promise<JWTPayload | null> {
  const token = extractToken(handshake);
  if (!token) {
    return null;
  }

  return verifyAccessToken(token);
}
