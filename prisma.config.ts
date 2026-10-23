// Prisma Configuration
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
