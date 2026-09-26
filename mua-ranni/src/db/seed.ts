// Isi awal database dari price list di src/data/services.ts.
// Jalankan sekali: npm run db:seed
//
// Aman dijalankan ulang: baris yang sudah ada TIDAK ditimpa (onConflictDoNothing),
// jadi harga yang sudah diubah lewat halaman admin tetap aman.

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { portfolioItems as staticPortfolio } from "../data/portfolio";
import { addOns as staticAddOns, serviceGroups as staticGroups } from "../data/services";
import { addOns, portfolioItems, serviceGroups, serviceItems } from "./schema";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL belum diisi di .env.local");

  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(client);

  await db.transaction(async (tx) => {
    await tx
      .insert(serviceGroups)
      .values(staticGroups.map((g) => ({ id: g.id, name: g.name, tier: g.tier, includes: g.includes, sortOrder: g.order })))
      .onConflictDoNothing();

    await tx
      .insert(serviceItems)
      .values(
        staticGroups.flatMap((g) =>
          g.items.map((item, i) => ({ id: item.id, groupId: g.id, name: item.name, price: item.price, sortOrder: i + 1 })),
        ),
      )
      .onConflictDoNothing();

    await tx
      .insert(addOns)
      .values(
        staticAddOns.map((a, i) => ({
          id: a.id,
          name: a.name,
          priceFrom: a.priceFrom,
          priceTo: a.priceTo ?? null,
          note: a.note ?? null,
          sortOrder: i + 1,
        })),
      )
      .onConflictDoNothing();

    // Foto dummy (Unsplash) ikut dimasukkan supaya bisa dihapus satu per satu dari admin.
    await tx
      .insert(portfolioItems)
      .values(
        staticPortfolio.map((p) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          imageUrl: p.imageUrl,
          beforeImageUrl: p.beforeImageUrl ?? null,
          description: p.description ?? null,
          featured: p.featured,
          createdAt: new Date(p.createdAt),
        })),
      )
      .onConflictDoNothing();
  });

  const [{ items, portfolio }] = await client`
    select (select count(*) from service_items)::int as items, (select count(*) from portfolio_items)::int as portfolio`;
  console.log(`Seed selesai. service_items: ${items} baris, portfolio_items: ${portfolio} baris.`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
