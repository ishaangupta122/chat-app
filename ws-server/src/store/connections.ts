/**
 * In-memory store for user connections
 * Maps userId -> Set of socket IDs (user can have multiple connections)
 */
const userConnections = new Map<string, Set<string>>();

/**
 * Maps socket ID -> userId for reverse lookup
 */
const socketToUser = new Map<string, string>();

/**
 * Add a new connection for a user
 */
export function addConnection(userId: string, socketId: string): void {
  // Add to user connections
  if (!userConnections.has(userId)) {
    userConnections.set(userId, new Set());
  }
  userConnections.get(userId)!.add(socketId);

  // Add reverse mapping
  socketToUser.set(socketId, userId);
}

/**
 * Remove a connection for a user
 */
export function removeConnection(userId: string, socketId: string): void {
  // Remove from user connections
  const connections = userConnections.get(userId);
  if (connections) {
    connections.delete(socketId);
    if (connections.size === 0) {
      userConnections.delete(userId);
    }
  }

  // Remove reverse mapping
  socketToUser.delete(socketId);
}

/**
 * Get all socket IDs for a user
 */
export function getConnections(userId: string): string[] {
  return Array.from(userConnections.get(userId) || []);
}

/**
 * Get user ID for a socket ID
 */
export function getUserBySocket(socketId: string): string | undefined {
  return socketToUser.get(socketId);
}

/**
 * Check if user has any active connections
 */
export function isUserConnected(userId: string): boolean {
  const connections = userConnections.get(userId);
  return !!connections && connections.size > 0;
}

/**
 * Get count of connections for a user
 */
export function getConnectionCount(userId: string): number {
  return userConnections.get(userId)?.size || 0;
}

/**
 * Get all connected user IDs
 */
export function getAllConnectedUsers(): string[] {
  return Array.from(userConnections.keys());
}

/**
 * Get total connection count across all users
 */
export function getTotalConnections(): number {
  return socketToUser.size;
}
