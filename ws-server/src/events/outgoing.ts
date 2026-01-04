// Outgoing WebSocket events (from server to client)
export const OUTGOING_EVENTS = {
  // Message events
  MESSAGE_NEW: "message:new",
  MESSAGE_UPDATE: "message:update",
  MESSAGE_DELETE: "message:delete",
  MESSAGE_READ: "message:read",

  // Typing events
  TYPING_UPDATE: "typing:update",

  // Presence events
  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:offline",
  PRESENCE_UPDATE: "presence:update",

  // Error events
  ERROR: "error",
} as const;

export type OutgoingEvent =
  (typeof OUTGOING_EVENTS)[keyof typeof OUTGOING_EVENTS];
