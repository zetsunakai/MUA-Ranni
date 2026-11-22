import "server-only";

import { asc } from "drizzle-orm";
import { cache } from "react";
import { readWithRetry } from "@/db/read-query";
import { getDb } from "@/db";
import { faqs } from "@/db/schema";
import { getBrands } from "@/lib/brands";
import { formatRupiah } from "@/lib/format";
import { getAddOns, getServiceGroups } from "@/lib/prices";
import { getProfile } from "@/lib/profile";

export type Faq = { q: string; a: string };

// FAQ yang tampil di website. Kalau admin belum pernah menyimpan FAQ (tabel kosong),
// pakai FAQ bawaan yang dirangkai dari data asli (harga, aturan booking, profil, brand).
export const getFaqs = cache(async (): Promise<{ faqs: Faq[]; isDefault: boolean }> => {
  const db = getDb();
  const rows = db ? await readWithRetry(() => db.select().from(faqs).orderBy(asc(faqs.sortOrder))) : [];
  if (rows.length) return { faqs: rows.map((r) => ({ q: r.question, a: r.answer })), isDefault: false };
  return { faqs: await defaultFaqs(), isDefault: true };
});

async function defaultFaqs(): Promise<Faq[]> {
  const [groups, addOns, profile, brandList] = await Promise.all([getServiceGroups(), getAddOns(), getProfile(), getBrands()]);
  const term = (startsWith: string) => profile.terms.find((t) => t.toLowerCase().startsWith(startsWith.toLowerCase())) ?? "";
  const includesByTier = (tier: "reguler" | "premium") =>
    groups
      .find((g) => g.tier === tier)
      ?.includes.map((i) => i.replace(/^free\s+/i, "").toLowerCase())
      .join(", ") ?? "";
  const extras = addOns
    .map((a) => `${a.name.toLowerCase()} ${formatRupiah(a.priceFrom)}${a.priceTo ? `–${formatRupiah(a.priceTo)}` : ""}`)
    .join(", ");

  return [
    {
      q: "Bagaimana cara booking?",
      a: `Cek dulu tanggal kosong di halaman Jadwal, lalu isi formulir booking untuk mengirim detail acara lewat WhatsApp. ${profile.depositInfo}`,
    },
    { q: "Berapa DP-nya dan kapan pelunasan?", a: `${profile.depositInfo} ${profile.paymentInfo}` },
    {
      q: "Harga sudah termasuk apa saja?",
      a: `Paket Reguler sudah termasuk ${includesByTier("reguler")}. Paket Premium sudah termasuk ${includesByTier("premium")}.${extras ? ` Tambahan di luar paket: ${extras}.` : ""}`,
    },
    { q: "Apakah harga bisa ditawar?", a: term("Semua harga") },
    { q: "Area mana saja yang dilayani?", a: `${profile.serviceAreas.join(", ")}.` },
    { q: "Bagaimana kalau cancel atau ganti tanggal?", a: [term("Cancel"), term("Reschedule")].filter(Boolean).join(" ") },
    {
      q: "Apa yang perlu disiapkan sebelum dirias?",
      a: [term("Client sudah siap"), term("Jam makeup"), term("Jika ada"), term("Untuk client berhijab")].filter(Boolean).join(" "),
    },
    { q: "Produk makeup apa yang dipakai?", a: brandList.length ? `${brandList.map((b) => b.name).join(", ")}.` : "" },
    { q: "Chat dibalas jam berapa?", a: `${profile.responseHours}.` },
  ].filter((f) => f.a.trim());
}
