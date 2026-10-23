import "server-only";
import { SignJWT, jwtVerify, type JWTPayload as JoseJWTPayload } from "jose";
import type { JWTPayload } from "@/types/auth";

// Environment variable for JWT secret
const getJwtSecret = (): Uint8Array => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return new TextEncoder().encode(secret);
};

// Token expiry time - 7 days
const TOKEN_EXPIRY = "7d";

/**
 * Sign an access token
 */
export async function signAccessToken(
  payload: Omit<JWTPayload, "iat" | "exp">
): Promise<string> {
  const token = await new SignJWT({ ...payload } as unknown as JoseJWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getJwtSecret());

  return token;
}

/**
 * Verify and decode an access token
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
