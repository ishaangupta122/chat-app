import "server-only";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

db.on("connect", () => {
  console.log("PostgreSQL connected");
});

db.on("error", (err) => {
  console.error("PostgreSQL pool error", err);
});
