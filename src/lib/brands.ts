import "server-only";

import { asc } from "drizzle-orm";
import { cache } from "react";
import { brands as staticBrands } from "@/data/services";
import { readWithRetry } from "@/db/read-query";
import { getDb } from "@/db";
import { brands } from "@/db/schema";
import type { Brand } from "@/types";

export type BrandRow = Brand & { id: string; logoPath: string | null };

// Logo brand produk sesuai urutan admin. Tanpa database: daftar bawaan di src/data/services.ts.
export const getBrands = cache(async (): Promise<BrandRow[]> => {
  const db = getDb();
  if (!db) return staticBrands.map((b) => ({ ...b, id: b.name, logoPath: null }));
  const rows = await readWithRetry(() => db.select().from(brands).orderBy(asc(brands.sortOrder)));
  return rows.map((r) => ({ id: r.id, name: r.name, logo: r.logoUrl, logoPath: r.logoPath, width: r.width, height: r.height }));
});
