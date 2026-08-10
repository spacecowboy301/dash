import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // The explicit error below provides the actionable setup instruction.
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for database commands.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
