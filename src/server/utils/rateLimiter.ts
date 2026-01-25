import "server-only";

/**
 * Rate Limiter - In-memory sliding window implementation
 *
 * For production, consider using Redis-based rate limiting
 * for distributed systems.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

// In-memory store for rate limits
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

let cleanupTimer: NodeJS.Timeout | null = null;

function startCleanupTimer() {
  if (cleanupTimer) return;

  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);

  // Don't block process exit
  cleanupTimer.unref();
}

startCleanupTimer();

// Pre-defined rate limit configurations
export const RATE_LIMITS = {
  // User search: 10 requests per minute
  userSearch: {
    maxRequests: 10,
    windowMs: 60 * 1000,
  },
  // Profile view: 30 requests per minute
  profileView: {
    maxRequests: 30,
    windowMs: 60 * 1000,
  },
  // Settings update: 5 requests per minute
  settingsUpdate: {
    maxRequests: 5,
    windowMs: 60 * 1000,
  },
  // Username check: 20 requests per minute
  usernameCheck: {
    maxRequests: 20,
    windowMs: 60 * 1000,
  },
} as const;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Check rate limit for a given key
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // No existing entry or window has expired
  if (!entry || entry.resetAt <= now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, newEntry);

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: newEntry.resetAt,
    };
  }

  // Within window
  if (entry.count < config.maxRequests) {
    entry.count++;
    rateLimitStore.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetAt: entry.resetAt,
    };
  }

  // Rate limit exceeded
  return {
    allowed: false,
    remaining: 0,
    resetAt: entry.resetAt,
    retryAfter: Math.ceil((entry.resetAt - now) / 1000),
  };
}

/**
 * Create a rate limit key for a user action
 */
export function createRateLimitKey(
  action: keyof typeof RATE_LIMITS,
  identifier: string
): string {
  return `${action}:${identifier}`;
}

/**
 * Rate limit a user action
 */
export function rateLimitAction(
  action: keyof typeof RATE_LIMITS,
  identifier: string
): RateLimitResult {
  const key = createRateLimitKey(action, identifier);
  const config = RATE_LIMITS[action];
  return checkRateLimit(key, config);
}

/**
 * Reset rate limit for a key (for testing)
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Clear all rate limits (for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}
