import "server-only";

import { asc } from "drizzle-orm";
import { cache } from "react";
import { addOns as staticAddOns, serviceGroups as staticGroups } from "@/data/services";
import { readWithRetry } from "@/db/read-query";
import { getDb } from "@/db";
import { addOns, serviceGroups, serviceItems } from "@/db/schema";
import type { AddOn, ServiceGroup } from "@/types";

// Satu-satunya pintu untuk membaca harga. Halaman publik dan admin sama-sama lewat sini.
// Kalau DATABASE_URL belum diisi (misalnya sebelum Supabase disambungkan),
// fallback ke price list statis di src/data/services.ts supaya website tetap jalan.

export const getServiceGroups = cache(async (): Promise<ServiceGroup[]> => {
  const db = getDb();
  if (!db) return staticGroups;

  const [groups, items] = await Promise.all([
    readWithRetry(() => db.select().from(serviceGroups).orderBy(asc(serviceGroups.sortOrder))),
    readWithRetry(() => db.select().from(serviceItems).orderBy(asc(serviceItems.sortOrder))),
  ]);

  return groups.map((g) => ({
    id: g.id,
    name: g.name,
    tier: g.tier,
    includes: g.includes,
    order: g.sortOrder,
    items: items.filter((i) => i.groupId === g.id).map((i) => ({ id: i.id, name: i.name, price: i.price })),
  }));
});

export const getAddOns = cache(async (): Promise<AddOn[]> => {
  const db = getDb();
  if (!db) return staticAddOns;

  const rows = await readWithRetry(() => db.select().from(addOns).orderBy(asc(addOns.sortOrder)));
  return rows.map((a) => ({
    id: a.id,
    name: a.name,
    priceFrom: a.priceFrom,
    priceTo: a.priceTo ?? undefined,
    note: a.note ?? undefined,
  }));
});

export function lowestPrice(groups: ServiceGroup[]): number | null {
  const prices = groups.flatMap(g => g.items.map(i => i.price)).filter(Number.isFinite);
  return prices.length ? Math.min(...prices) : null;
}
