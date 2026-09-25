// Isi awal database dari price list di src/data/services.ts.
// Jalankan sekali: npm run db:seed
//
// Aman dijalankan ulang: baris yang sudah ada TIDAK ditimpa (onConflictDoNothing),
// jadi harga yang sudah diubah lewat halaman admin tetap aman.

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { addOns as staticAddOns, serviceGroups as staticGroups } from "../data/services";
import { addOns, serviceGroups, serviceItems } from "./schema";

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
  });

  const [{ count }] = await client`select count(*)::int as count from service_items`;
  console.log(`Seed selesai. service_items sekarang berisi ${count} baris.`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
