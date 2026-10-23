// Incoming WebSocket events (from client to server)
export const INCOMING_EVENTS = {
  // Message events
  MESSAGE_SEND: "message:send",
  MESSAGE_READ: "message:read",

  // Typing events
  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",

  // Presence events
  PRESENCE_UPDATE: "presence:update",

  // Room events
  ROOM_JOIN: "room:join",
  ROOM_LEAVE: "room:leave",
} as const;

export type IncomingEvent =
  (typeof INCOMING_EVENTS)[keyof typeof INCOMING_EVENTS];
