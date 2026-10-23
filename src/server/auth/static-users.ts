import "server-only";
import type { AuthUser } from "@/types/auth";

/**
 * TEMPORARY: in-memory users used when STATIC_AUTH=true so the app can be
 * tested without a database. Remove together with the STATIC_AUTH branches
 * in ./auth.ts.
 */
export const STATIC_AUTH = process.env.STATIC_AUTH === "true";

export type StaticUser = AuthUser & { password: string };

const seed = (
  id: string,
  username: string,
  displayName: string
): StaticUser => ({
  id,
  username,
  email: `${username}@example.com`,
  displayName,
  avatar: null,
  provider: "email",
  providerId: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  password: "password123",
});

// Survive dev hot-reloads / separate route bundles
const globalForStatic = globalThis as unknown as {
  staticUsers?: Map<string, StaticUser>;
};

export const staticUsers: Map<string, StaticUser> = (globalForStatic.staticUsers ??=
  new Map(
    [
      seed("static-user-1", "demo", "Demo User"),
      seed("static-user-2", "alice", "Alice"),
      seed("static-user-3", "bob", "Bob"),
    ].map((u) => [u.id, u])
  ));

export function toPublicUser({ password: _password, ...user }: StaticUser): AuthUser {
  return user;
}
