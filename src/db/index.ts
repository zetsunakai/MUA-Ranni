import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// pg-pool removes clients that report query errors. Bound both connection
// acquisition and query execution so an unresponsive socket cannot occupy a
// pool slot indefinitely and make every following request time out.
function createDatabase(url: string) {
  const pool = new Pool({
    connectionString: url,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
    query_timeout: 8_000,
  });
  // Idle clients can emit errors between queries. pg-pool already removes
  // them; the listener prevents an unhandled EventEmitter error crashing Next.
  pool.on("error", (error) => {
    console.warn("[database] Idle connection closed", { code: (error as Error & { code?: string }).code ?? "CONNECTION_CLOSED" });
  });
  return { url, pool, db: drizzle(pool, { schema }) };
}

// Store the pool alongside Drizzle across HMR. A changed connection string
// must acquire a new pool rather than reuse the previous environment's clients.
const globalForDb = globalThis as unknown as { database?: ReturnType<typeof createDatabase> };

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!globalForDb.database || globalForDb.database.url !== url) {
    const previous = globalForDb.database;
    globalForDb.database = createDatabase(url);
    if (previous) void previous.pool.end().catch(() => undefined);
  }
  return globalForDb.database.db;
}
