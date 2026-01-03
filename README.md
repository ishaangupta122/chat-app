# 💬 Real-Time Messaging Platform

A production-ready, relationship-driven real-time chat application built with **Next.js**, **WebSockets**, and **PostgreSQL**.  
The system is designed with **clear separation of concerns**, **invite-based relationships**, and **scalable backend services**.

---

## 📖 Description

This project implements a modern messaging system supporting **1-to-1 chats**, **group chats**, and **real-time communication**.  
It separates **stateful operations** (REST APIs) from **event-driven operations** (WebSockets) to ensure reliability, scalability, and maintainability.

The architecture follows industry best practices used in real-world chat systems.

---

## 🧰 Tech Stack

### Frontend

- Next.js (App Router)
- React
- TypeScript

### Backend

- Next.js API Routes (REST)
- Standalone Node.js WebSocket Server

### Data & Infra

- PostgreSQL (primary datastore)
- Redis (optional, for pub/sub & presence)
- JWT Authentication

---

## ⚙️ Setup Commands (Local Development)

```bash
# Install dependencies
npm install

# Start Next.js (HTTP server)
npm run dev

# Start WebSocket server
npm run ws:dev

```

---

## ✨ Features

### Authentication & Identity

- JWT-based authentication
- Shared auth for REST APIs and WebSocket connections
- Public (username) vs private (email/phone) identity separation

### User Discovery

- Username-based search only
- Privacy-first, opt-in discovery
- Rate-limited search

### Invite System (Core)

- Unified invite model
- Friend requests, group invites, email invites
- Invite lifecycle: pending, accepted, rejected, expired

### 1-to-1 Messaging

- Friend-based, consent-driven chats
- Messaging unlocked only after invite acceptance
- Saved users via friendships

### Group Chats

- Group creation and membership
- Invite-link based joining
- Role-based access (owner, admin, member)

### Conversations & Messages

- Conversation-based messaging model
- Persistent message storage
- Cursor-based pagination
- Read receipts

### Real-Time Capabilities

- Dedicated WebSocket server
- Real-time message delivery
- Presence (online/offline)
- Typing indicators
- Conversation-based rooms

### Architecture Guarantees

- REST APIs handle state & persistence
- WebSockets handle real-time delivery only
- Shared backend logic for consistency
- Separate runtimes for HTTP and WebSocket servers

## 🗂️ Folder Structure

chat-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── invites/
│   │   │   ├── friends/
│   │   │   ├── conversations/
│   │   │   ├── messages/
│   │   │   ├── groups/
│   │   │   └── health/
│   │   ├── layout/
│   │   └── pages/
│   │
│   ├── server/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── services/
│   │   ├── permissions/
│   │   ├── validators/
│   │   └── utils/
│   │
│   ├── components/
│   ├── sections/
│   ├── hooks/
│   ├── context/
│   ├── constants/
│   └── types/
│
├── ws-server/
│   ├── src/
│   │   ├── handlers/
│   │   ├── events/
│   │   ├── store/
│   │   └── utils/
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── package.json
├── tsconfig.json
└── README.md

