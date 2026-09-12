import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

let database: ReturnType<typeof createDatabase>;

function createDatabase(pool: Pool) {
  return drizzle(pool);
}

// Initialize inside request handlers so their existing fallbacks can handle
// missing configuration without crashing the module import and entire page.
export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing. Configure .env.local using .env.example, then restart the dev server.");
  }
  if (!database) {
    const pool = globalForDb.__arenaNextJsPostgresqlPool ?? new Pool({
      connectionString: databaseUrl,
      connectionTimeoutMillis: 5000,
    });
    if (process.env.NODE_ENV !== "production") {
      globalForDb.__arenaNextJsPostgresqlPool = pool;
    }
    database = createDatabase(pool);
  }
  return database;
}
