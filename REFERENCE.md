# 🛠️ Feature Implementation Reference (Developer Checklist)

This document is a **developer-facing reference** for all features and systems that must be implemented in this project.  
Use it as a **checklist + scope definition** while building.

This is **not marketing**, **not UX**, and **not high-level theory** — it describes **what needs to exist in code and why**.

---

## 1️⃣ Authentication & Identity

### Goals

- Secure user identity
- Single auth source for REST + WebSocket

### Must Implement

- User signup & login (email + password or provider)
- JWT-based authentication
- JWT usable by:
  - Next.js REST APIs
  - WebSocket server
- Auth middleware for API routes
- Auth verification during WebSocket handshake

### Notes

- JWT = single source of truth
- No session-based WS auth
- No business logic in auth layer

---

## 2️⃣ User Model & Identity Separation

### Goals

- Strong privacy guarantees
- Clear public vs private identity

### Must Implement

- User entity with:
  - `id` (internal)
  - `username` (public, unique)
  - `email` (private, unique)
  - `phone` (private, optional)
- Public profile view:
  - username
  - avatar
  - limited metadata
- Private profile data never exposed via search

### Rules

- Email/phone are NOT searchable
- Username is the only discoverable identifier

---

## 3️⃣ User Discovery

### Goals

- Controlled, privacy-safe discovery
- No direct DB exposure

### Must Implement

- Search users by username (exact or partial)
- Rate-limiting on search
- Return only public profile fields
- Ability to disable discovery (optional)

### Must NOT Do

- No email-based search
- No phone-number-based search
- No full user objects in responses

---

## 4️⃣ Invite System (Core Primitive)

### Goals

- One unified system for all connection flows

### Must Implement

- Generic `Invite` concept
- Invite types:
  - `FRIEND_REQUEST`
  - `GROUP_INVITE`
  - `EMAIL_INVITE` (future-ready)
- Invite states:
  - `PENDING`
  - `ACCEPTED`
  - `REJECTED`
  - `EXPIRED`
- Invite expiration handling
- Idempotent accept/reject logic

### Notes

- Friend request IS an invite
- Invite acceptance triggers side effects

---

## 5️⃣ Friendship System (1-to-1 Relationships)

### Goals

- Consent-based 1-to-1 messaging
- Saved users & rediscovery

### Must Implement

- Friendship states:
- Send friend request (creates invite)
- Accept / reject friend request
- Remove friend (soft remove)
- Block user

### Rules

- 1-to-1 chat allowed ONLY if friendship = ACCEPTED
- Removing a friend hides chat, does not delete history
- Friendship is independent of conversations

---

## 6️⃣ Conversations (Chat Containers)

### Goals

- Stable message containers
- Separation between relationship and messaging

### Must Implement

- Conversation entity
- Conversation types:
- `DIRECT`
- `GROUP`
- Create 1-to-1 conversation only after friendship acceptance
- Create group conversations
- Archive / hide conversations per user
- Fetch conversation list (sorted by last activity)

### Rules

- Users message conversations, not users
- Conversation existence does not define relationship

---

## 7️⃣ Messages (Persistence Layer)

### Goals

- Durable message storage
- Efficient history loading

### Must Implement

- Message entity with:
- conversation_id
- sender_id
- content
- timestamps
- Message pagination (cursor-based)
- Read receipt persistence
- Message ordering guarantees

### Rules

- Message creation triggered by WebSocket
- Message retrieval handled via REST
- No real-time logic in REST layer

---

## 8️⃣ Group Chats

### Goals

- Scalable multi-user communication
- Low-friction onboarding

### Must Implement

- Group creation
- Group roles:
- owner
- admin
- member
- Group invite links
- Group invite acceptance
- Join / leave group
- List group members

### Rules

- Group membership ≠ friendship
- Group join does not auto-create friendships
- Admin-only actions enforced

---

## 9️⃣ REST API Layer (State Management)

### Goals

- Persisted, queryable system state

### Must Implement APIs For

- Auth validation
- User discovery
- Invites (send / accept / reject / list)
- Friend management
- Conversation listing & metadata
- Message history
- Group management

### REST APIs Must

- Be thin
- Validate input
- Call shared service layer
- Never contain business rules

---

## 🔟 WebSocket Server (Real-Time Layer)

### Goals

- Low-latency event delivery
- Scalable real-time system

### Must Implement

- Standalone Node.js process
- Own HTTP/WS server
- JWT authentication on connection
- Room management per conversation
- Real-time events:
- send_message
- receive_message
- typing_start / typing_stop
- user_online / user_offline
- Presence tracking
- Graceful reconnect handling

### Rules

- WebSocket server does NOT fetch history
- WebSocket server does NOT create friendships/groups
- WebSocket server persists messages but does not own rules

---

## 1️⃣1️⃣ Shared Backend Logic (`server/`)

### Goals

- Single source of business truth
- No duplicated logic

### Must Implement

- Service layer:
- invite.service
- friendship.service
- conversation.service
- message.service
- group.service
- Permission checks:
- canSendMessage
- canJoinGroup
- isGroupAdmin
- Validators:
- invite input
- message input
- group input

### Rules

- Both REST APIs and WS server consume this layer
- No frontend imports from this layer

---

## 1️⃣2️⃣ Ports & Runtime Model

### Local Development

- Next.js (HTTP) → localhost:3000
- WebSocket Server → localhost:3001

### Production

- Same domain
- Reverse proxy routes HTTP vs WS
- Separate services, shared infra

---

## 1️⃣3️⃣ Explicit Non-Goals (Out of Scope)

- ❌ Direct user-to-user messaging without consent
- ❌ WebSockets inside Next.js API routes
- ❌ Email/phone-based user search
- ❌ Business logic inside API handlers
- ❌ Single-process HTTP + WS server

---

## 1️⃣4️⃣ Implementation Order (Strongly Recommended)

1. Database schema
2. Auth
3. User discovery
4. Invite system
5. Friendship logic
6. Conversation creation
7. Message persistence
8. WebSocket auth
9. Real-time messaging
10. Presence & typing
11. Groups

---

## Final Definition

This project implements a:

**Relationship-driven, invite-based, real-time messaging system**  
with explicit permission boundaries, scalable runtimes, and production-grade architecture.

Use this file as the **source of truth for scope and implementation**.
