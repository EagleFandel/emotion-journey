import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { appConfig, dailyReviews, moodEntries, users } from "./schema";

let pool: Pool | null = null;
const persistenceModeLoggedKey = "__emotion_journey_persistence_mode_logged__";

type PersistenceMode = "database" | "memory-dev" | "blocked-production";

export class PersistenceUnavailableError extends Error {
  readonly code = "PERSISTENCE_UNAVAILABLE";

  constructor(message = "DATABASE_URL is required in production.") {
    super(message);
    this.name = "PersistenceUnavailableError";
  }
}

function resolvePersistenceMode(): PersistenceMode {
  if (process.env.DATABASE_URL) {
    return "database";
  }
  if (process.env.NODE_ENV === "production") {
    return "blocked-production";
  }
  return "memory-dev";
}

function logPersistenceModeOnce(mode: PersistenceMode): void {
  const target = globalThis as typeof globalThis & { [persistenceModeLoggedKey]?: boolean };
  if (target[persistenceModeLoggedKey]) {
    return;
  }

  target[persistenceModeLoggedKey] = true;
  console.info(`[persistence] mode=${mode}`);

  if (mode === "blocked-production") {
    console.error("[persistence] DATABASE_URL is missing in production and persistence is blocked.");
  }
}

export function getPersistenceMode(): PersistenceMode {
  const mode = resolvePersistenceMode();
  logPersistenceModeOnce(mode);
  return mode;
}

export function hasDatabaseUrl(): boolean {
  return getPersistenceMode() === "database";
}

export function shouldUseInMemoryStore(): boolean {
  return getPersistenceMode() === "memory-dev";
}

export function assertPersistenceAvailable(): void {
  if (getPersistenceMode() === "blocked-production") {
    throw new PersistenceUnavailableError();
  }
}

function getPool(): Pool {
  assertPersistenceAvailable();

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
