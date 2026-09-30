import type { Metadata } from "next";
import Link from "next/link";
import { ChatIcon } from "@/components/icons";
import { bookingInfo, brands, terms } from "@/data/services";
import { formatRupiah } from "@/lib/format";
import { getAddOns, getServiceGroups } from "@/lib/prices";
import { getProfile } from "@/lib/profile";
import { bookingFormUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Jawaban pertanyaan yang sering ditanyakan: cara booking, DP, transport, cancel, reschedule, dan persiapan sebelum dirias.",
  alternates: { canonical: "/faq" },
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
      a: `Cek dulu tanggal kosong di halaman Jadwal, lalu isi formulir booking untuk mengirim detail acara lewat WhatsApp. ${bookingInfo.deposit}`,
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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 pt-10 pb-14 sm:px-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:pt-24 md:pb-28">
        {/* Judul ikut menempel saat daftar pertanyaan di-scroll (desktop) */}
        <div className="md:sticky md:top-32 md:self-start">
          <p className="text-xs font-semibold tracking-[0.25em] text-accent-strong uppercase">FAQ</p>
          <h1 className="mt-4 font-heading text-[56px] leading-[0.95] tracking-tight md:mt-5 md:text-8xl">
            Yang sering <em>ditanyakan.</em>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted md:mt-5 md:text-lg">
            Detail harga ada di{" "}
            <Link href="/layanan" className="font-medium text-accent-strong underline underline-offset-4">
              Layanan &amp; Harga
            </Link>
            , tanggal kosong di{" "}
            <Link href="/jadwal" className="font-medium text-accent-strong underline underline-offset-4">
              Jadwal
            </Link>
            .
          </p>
        </div>

        <div className="border-t border-foreground">
          {faqs.map((f) => (
            <details key={f.q} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 md:py-6 [&::-webkit-details-marker]:hidden">
                <span className="font-heading text-[24px] leading-tight transition-colors group-hover:text-accent-strong md:text-[30px]">
                  {f.q}
                </span>
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-foreground transition-[transform,background-color,color] group-open:rotate-45 group-open:bg-foreground group-open:text-background"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="-mt-1 pr-14 pb-6 text-[15px] leading-relaxed text-muted md:text-[17px]">{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Ajakan chat, menyambung ke footer gelap */}
      <section className="bg-foreground text-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pt-12 pb-12 sm:px-6 md:flex-row md:items-end md:justify-between md:pt-20">
          <div>
            <h2 className="font-heading text-[44px] leading-none md:text-7xl">
              Masih ada <em>pertanyaan?</em>
            </h2>
            <p className="mt-5 max-w-md text-[15px] text-background/80 md:text-[17px]">
              Tanya langsung lewat WhatsApp, dibalas secepatnya.
            </p>
          </div>
          <a
            href={bookingFormUrl("faq-cta", { note: "Saya mau tanya soal makeup." })}
            className="flex items-center justify-center gap-2 rounded-full bg-background px-8 py-4 font-medium text-foreground transition-colors hover:bg-accent-soft md:shrink-0"
          >
            <ChatIcon />
            Chat WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
