import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// DATABASE_URL = connection string "Transaction pooler" dari Supabase (port 6543).
//
// Driver: node-postgres (pg), BUKAN postgres.js. postgres.js menumpuk (pipelining)
// beberapa query di satu koneksi saat semua koneksi sibuk, dan Supabase transaction
// pooler kadang kehilangan jawabannya -> query menggantung. Ini membuat `next build`
// di Vercel (1 worker, 36 halaman sekaligus) timeout. pg menjalankan satu query per
// koneksi dan sisanya antre di pool, jadi aman untuk transaction pooler.
function createDb(url: string) {
  const pool = new Pool({
    connectionString: url,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 15_000,
  });
  return drizzle(pool, { schema });
}

// Di mode dev, file ini dimuat ulang setiap ada perubahan kode; simpan koneksi di
// globalThis supaya tidak membuka koneksi baru terus-menerus.
const globalForDb = globalThis as unknown as { db?: ReturnType<typeof createDb> };

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  globalForDb.db ??= createDb(url);
  return globalForDb.db;
}
