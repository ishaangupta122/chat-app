import { db } from "./index";

// SQL Schema for users table
export const createUsersTableSQL = `
  CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(26) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    avatar TEXT,
    password_hash TEXT,
    provider VARCHAR(20) NOT NULL DEFAULT 'email',
    provider_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(email),
    UNIQUE(provider, provider_id)
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);
`;

// SQL Schema for refresh tokens (for token invalidation/rotation)
export const createRefreshTokensTableSQL = `
  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id VARCHAR(26) PRIMARY KEY,
    user_id VARCHAR(26) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(token_hash)
  );

  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
`;

// Initialize database schema
export async function initializeSchema(): Promise<void> {
  try {
    await db.query(createUsersTableSQL);
    await db.query(createRefreshTokensTableSQL);
    console.log("Database schema initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database schema:", error);
    throw error;
  }
}

// User row type from database
export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  password_hash: string | null;
  provider: string;
  provider_id: string | null;
  created_at: Date;
  updated_at: Date;
}

// Refresh token row type from database
export interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  revoked_at: Date | null;
}
