import "server-only";

/**
 * Generate a unique ID (26 characters, similar to ULID format)
 * Uses timestamp + random for uniqueness and sortability
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 8);
  return `${timestamp}${randomPart}${randomPart2}`.substring(0, 26);
}

/**
 * Generate a short ID (for temporary/session use)
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Validate ID format
 */
export function isValidId(id: string): boolean {
  return (
    typeof id === "string" &&
    id.length >= 10 &&
    id.length <= 30 &&
    /^[a-z0-9]+$/.test(id)
  );
}
