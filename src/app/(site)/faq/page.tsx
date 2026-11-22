import type { Metadata } from "next";
import Link from "next/link";
import { ChatIcon } from "@/components/icons";
import { getFaqs } from "@/lib/faqs";
import { getProfile } from "@/lib/profile";
import { bookingFormUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Jawaban pertanyaan yang sering ditanyakan: cara booking, DP, cancel, reschedule, dan persiapan sebelum dirias.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const [{ faqs }, profile] = await Promise.all([getFaqs(), getProfile()]);

  // Data terstruktur untuk Google (FAQPage). "<" di-escape untuk mencegah XSS.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <section className="contact-opening product-band"><div className="editorial-container"><div>
          <p className="text-xs font-semibold tracking-[0.25em] text-accent-strong uppercase">FAQ</p>
          <h1 className="mt-4 font-heading text-[44px] leading-[1.12] tracking-[-0.025em] md:mt-5 md:text-[64px]">
            Yang sering <em>ditanyakan.</em>
          </h1>
          <p className="mt-4 text-[15px] leading-[1.9] text-muted md:mt-5 md:text-base">
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
      </div><div className="response-card"><p className="editorial-label">Jam respon chat</p><p className="font-heading">{profile.responseHours}</p><Link href={bookingFormUrl("faq-cta")} className="editorial-text-link">Chat WhatsApp →</Link></div></div></section>
      <div className="editorial-container faq-spread editorial-section">
        <aside><p className="editorial-label">FAQ</p><h2 className="editorial-title">Sebelum booking</h2><p className="editorial-description mt-6">{profile.depositInfo}</p><p className="editorial-description mt-4">{profile.paymentInfo}</p><Link href="/kontak" className="editorial-text-link">Mulai booking di sini. →</Link></aside>
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

      {/* Ajakan chat, sebelum footer */}
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
          <Link
            href={bookingFormUrl("faq-cta", { note: "Saya mau tanya soal makeup." })}
            className="flex items-center justify-center gap-2 rounded-none bg-background px-8 py-4 font-medium text-foreground transition-colors hover:bg-accent-soft md:shrink-0"
          >
            <ChatIcon />
            Chat WhatsApp
          </Link>
        </div>
      </section>
    </>
  );
}
