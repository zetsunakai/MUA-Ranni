import "server-only";

import { desc, eq } from "drizzle-orm";
import { cache } from "react";
import { portfolioItems as staticPortfolio } from "@/data/portfolio";
import { getDb } from "@/db";
import { portfolioItems } from "@/db/schema";
import type { PortfolioItem } from "@/types";

// Pintu tunggal untuk membaca portofolio (halaman publik dan admin).
// Tanpa DATABASE_URL, pakai data dummy di src/data/portfolio.ts.

type Row = typeof portfolioItems.$inferSelect;

function toItem(row: Row): PortfolioItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    imageUrl: row.imageUrl,
    beforeImageUrl: row.beforeImageUrl ?? undefined,
    description: row.description ?? undefined,
    featured: row.featured,
    createdAt: row.createdAt.toISOString(),
  };
}

// Terbaru di atas.
export const getPortfolioItems = cache(async (): Promise<PortfolioItem[]> => {
  const db = getDb();
  if (!db) return [...staticPortfolio].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const rows = await db.select().from(portfolioItems).orderBy(desc(portfolioItems.createdAt));
  return rows.map(toItem);
});

export async function getPortfolioItem(id: string): Promise<PortfolioItem | null> {
  const db = getDb();
  if (!db) return staticPortfolio.find((p) => p.id === id) ?? null;
  const [row] = await db.select().from(portfolioItems).where(eq(portfolioItems.id, id));
  return row ? toItem(row) : null;
}
