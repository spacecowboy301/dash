import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured. Copy .env.example to .env.local.");
}

const globalForDb = globalThis as unknown as {
  sqlClient?: ReturnType<typeof postgres>;
};

export const sqlClient =
  globalForDb.sqlClient ??
  postgres(databaseUrl, {
    max: process.env.NODE_ENV === "production" ? 10 : 3,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.sqlClient = sqlClient;
}

export const db = drizzle(sqlClient);
