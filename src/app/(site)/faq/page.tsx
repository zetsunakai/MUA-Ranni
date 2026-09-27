import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import WhatsAppCta from "@/components/WhatsAppCta";
import { bookingInfo, brands, terms } from "@/data/services";
import { formatRupiah } from "@/lib/format";
import { getAddOns, getServiceGroups } from "@/lib/prices";
import { getProfile } from "@/lib/profile";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Jawaban pertanyaan yang sering ditanyakan: cara booking, DP, transport, cancel, reschedule, dan persiapan sebelum dirias.",
};

// Semua jawaban dirangkai dari data asli (price list, syarat & ketentuan, profil admin),
// jadi ikut berubah kalau datanya diubah. Jangan menambah jawaban yang tidak ada datanya.
const term = (startsWith: string) => terms.find((t) => t.toLowerCase().startsWith(startsWith.toLowerCase())) ?? "";

export default async function FaqPage() {
  const [groups, addOns, profile] = await Promise.all([getServiceGroups(), getAddOns(), getProfile()]);

  const includesByTier = (tier: "reguler" | "premium") =>
    groups
      .find((g) => g.tier === tier)
      ?.includes.map((i) => i.replace(/^free\s+/i, "").toLowerCase())
      .join(", ") ?? "";
  const extras = addOns
    .map((a) => `${a.name.toLowerCase()} ${formatRupiah(a.priceFrom)}${a.priceTo ? `–${formatRupiah(a.priceTo)}` : ""}`)
    .join(", ");

  const faqs: { q: string; a: string }[] = [
    {
      q: "Bagaimana cara booking?",
      a: `Cek dulu tanggal kosong di halaman Jadwal, lalu chat WhatsApp dengan tanggal, jam, lokasi, dan jenis makeup. ${bookingInfo.deposit}`,
    },
    { q: "Berapa DP-nya dan kapan pelunasan?", a: `${bookingInfo.deposit} ${bookingInfo.payment}` },
    {
      q: "Harga sudah termasuk apa saja?",
      a: `Paket Reguler sudah termasuk ${includesByTier("reguler")}. Paket Premium sudah termasuk ${includesByTier("premium")}. Tambahan di luar paket: ${extras}.`,
    },
    { q: "Apakah harga bisa ditawar?", a: term("Semua harga") },
    { q: "Apakah ada biaya transport?", a: bookingInfo.transport },
    { q: "Area mana saja yang dilayani?", a: `${profile.serviceAreas.join(", ")}. ${bookingInfo.transport}` },
    { q: "Bagaimana kalau cancel atau ganti tanggal?", a: `${term("Cancel")} ${term("Reschedule")}` },
    {
      q: "Apa yang perlu disiapkan sebelum dirias?",
      a: [term("Client sudah siap"), term("Jam makeup"), term("Jika ada"), term("Untuk client berhijab")].join(" "),
    },
    { q: "Produk makeup apa yang dipakai?", a: `${brands.map((b) => b.name).join(", ")}.` },
    { q: "Chat dibalas jam berapa?", a: `${profile.responseHours}.` },
  ].filter((f) => f.a.trim());

  // Data terstruktur untuk Google (FAQPage). "<" di-escape untuk mencegah XSS.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <SectionHeading as="h1" eyebrow="FAQ" title="Pertanyaan yang sering ditanyakan" />

      <div className="mt-8 divide-y divide-line rounded-xl border border-line bg-surface">
        {faqs.map((f) => (
          <details key={f.q} className="group px-4 sm:px-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
              {f.q}
              <span aria-hidden="true" className="text-xl leading-none text-accent-strong transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="pb-4 text-foreground/80">{f.a}</p>
          </details>
        ))}
      </div>

      <p className="mt-6 text-sm text-foreground/70">
        Detail harga ada di{" "}
        <Link href="/layanan" className="font-medium text-accent-strong">
          Layanan & Harga
        </Link>
        , tanggal kosong di{" "}
        <Link href="/jadwal" className="font-medium text-accent-strong">
          Jadwal
        </Link>
        .
      </p>

      <div className="mt-10">
        <WhatsAppCta source="kontak" title="Masih ada pertanyaan?" description="Tanya langsung lewat WhatsApp, dibalas secepatnya." />
      </div>
    </div>
  );
}
