import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// DATABASE_URL = connection string "Transaction pooler" dari Supabase (port 6543).
// Pooler mode transaction tidak mendukung prepared statement, jadi prepare: false.
// Jangan set max: 1. Saat `next build`, beberapa halaman membaca harga bersamaan
// dan satu koneksi membuat render macet sampai timeout 60 detik.
function createDb(url: string) {
  return drizzle(postgres(url, { prepare: false }), { schema });
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
