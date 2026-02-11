import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { appConfig, dailyReviews, moodEntries, users } from "./schema";

let pool: Pool | null = null;

export function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }

  return pool;
}

export function getDb() {
  const instance = drizzle(getPool(), {
    schema: {
      users,
      moodEntries,
      dailyReviews,
      appConfig,
    },
  });

  return instance;
}