/**
 * In-memory store for user presence status
 */

type PresenceStatus = "online" | "away" | "busy" | "offline";

interface PresenceInfo {
  status: PresenceStatus;
  lastSeen: Date;
}

const userPresence = new Map<string, PresenceInfo>();

/**
 * Set user as online
 */
export function setUserOnline(userId: string): void {
  userPresence.set(userId, {
    status: "online",
    lastSeen: new Date(),
  });
}

/**
 * Set user as offline
 */
export function setUserOffline(userId: string): void {
  userPresence.set(userId, {
    status: "offline",
    lastSeen: new Date(),
  });
}

/**
 * Update user presence status
 */
export function updatePresence(userId: string, status: PresenceStatus): void {
  userPresence.set(userId, {
    status,
    lastSeen: new Date(),
  });
}

/**
 * Get user presence status
 */
export function getPresence(userId: string): PresenceStatus {
  return userPresence.get(userId)?.status || "offline";
}

/**
 * Get user's last seen time
 */
export function getLastSeen(userId: string): Date | null {
  return userPresence.get(userId)?.lastSeen || null;
}

/**
 * Get full presence info for a user
 */
export function getPresenceInfo(userId: string): PresenceInfo | null {
  return userPresence.get(userId) || null;
}

/**
 * Get presence for multiple users
 */
export function getBulkPresence(
  userIds: string[]
): Record<string, PresenceInfo> {
  const result: Record<string, PresenceInfo> = {};

  for (const userId of userIds) {
    const info = userPresence.get(userId);
    if (info) {
      result[userId] = info;
    } else {
      result[userId] = { status: "offline", lastSeen: new Date(0) };
    }
  }

  return result;
}

/**
 * Get all online users
 */
export function getOnlineUsers(): string[] {
  const online: string[] = [];
  for (const [userId, info] of userPresence.entries()) {
    if (info.status !== "offline") {
      online.push(userId);
    }
  }
  return online;
}
