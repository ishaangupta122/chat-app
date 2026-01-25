-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('email', 'google');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "display_name" VARCHAR(100),
    "bio" VARCHAR(500),
    "avatar" TEXT,
    "password_hash" TEXT,
    "provider" "AuthProvider" NOT NULL DEFAULT 'email',
    "provider_id" VARCHAR(255),
    "is_discoverable" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_provider_provider_id_idx" ON "users"("provider", "provider_id");
