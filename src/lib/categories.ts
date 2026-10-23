import "server-only";

import { asc, sql } from "drizzle-orm";
import { cache } from "react";
import { defaultCategories } from "@/data/site";
import { readWithRetry } from "@/db/read-query";
import { getDb } from "@/db";
import { categoryTable, portfolioItems, testimonials } from "@/db/schema";
import type { CategoryOption } from "@/types";

// Daftar kategori sesuai urutan yang diatur admin. Tanpa database: kategori bawaan.
export const getCategories = cache(async (): Promise<CategoryOption[]> => {
  const db = getDb();
  if (!db) return defaultCategories;
  return readWithRetry(() => db
    .select({ id: categoryTable.id, label: categoryTable.label })
    .from(categoryTable)
    .orderBy(asc(categoryTable.sortOrder)));
});

export function labelOf(categories: CategoryOption[], id: string): string {
  return categories.find((c) => c.id === id)?.label ?? id;
}

// Untuk halaman admin kategori: berapa foto & testimoni yang memakai tiap kategori.
export async function getCategoriesWithUsage() {
  const db = getDb();
  if (!db) return null;
  return db
    .select({
      id: categoryTable.id,
      label: categoryTable.label,
      sortOrder: categoryTable.sortOrder,
      photos: sql<number>`(select count(*)::int from ${portfolioItems} where ${portfolioItems.category} = ${categoryTable.id})`,
      testimonials: sql<number>`(select count(*)::int from ${testimonials} where ${testimonials.eventType} = ${categoryTable.id})`,
    })
    .from(categoryTable)
    .orderBy(asc(categoryTable.sortOrder));
}

export async function categoryExists(id: string): Promise<boolean> {
  const categories = await getCategories();
  return categories.some((c) => c.id === id);
}
