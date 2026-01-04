import "server-only";
import { jwtVerify, createRemoteJWKSet } from "jose";
import type { GoogleTokenPayload } from "@/types/auth";

// Google's JWKS endpoint for verifying ID tokens
const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

// Google OAuth client ID from environment
const getGoogleClientId = (): string => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not defined in environment variables");
  }
  return clientId;
};

/**
 * Verify a Google ID token and extract user information
 */
export async function verifyGoogleToken(
  idToken: string
): Promise<GoogleTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: getGoogleClientId(),
    });

    // Validate required fields
    if (!payload.sub || !payload.email) {
      return null;
    }

    return {
      sub: payload.sub as string,
      email: payload.email as string,
      email_verified: payload.email_verified as boolean,
      name: (payload.name as string) || "",
      picture: payload.picture as string | undefined,
    };
  } catch (error) {
    console.error("Google token verification failed:", error);
    return null;
  }
}
