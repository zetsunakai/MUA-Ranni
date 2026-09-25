import Image from "next/image";
import Link from "next/link";
import FeaturedPortfolio from "@/components/FeaturedPortfolio";
import SectionHeading from "@/components/SectionHeading";
import TestimonialCard from "@/components/TestimonialCard";
import WhatsAppCta from "@/components/WhatsAppCta";
import { ArrowRightIcon, CheckIcon, ChatIcon } from "@/components/icons";
import { about } from "@/data/about";
import { portfolioItems } from "@/data/portfolio";
import { site } from "@/data/site";
import { formatRupiah } from "@/lib/format";
import { getServiceGroups, lowestPrice } from "@/lib/prices";
import { getPublicTestimonials } from "@/lib/testimonials";
import { whatsappUrl } from "@/lib/whatsapp";

// Grup yang diringkas di Home. Daftar lengkap ada di /layanan.
const HIGHLIGHT_GROUPS = ["reguler-dewasa", "premium-dewasa", "premium-pernikahan"];

export default async function Home() {
  const serviceGroups = await getServiceGroups();
  const featured = portfolioItems.filter((item) => item.featured).slice(0, 6);
  const highlightGroups = serviceGroups.filter((g) => HIGHLIGHT_GROUPS.includes(g.id));
  const testimonials = getPublicTestimonials().slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.1fr_1fr] md:gap-12 md:py-16">
        <div className="flex flex-col items-start gap-5">
          <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-strong">
            {site.serviceAreas.join(" · ")}
          </span>
          <h1 className="font-heading text-4xl font-semibold leading-tight sm:text-5xl">
            Riasan flawless untuk wisuda, pesta, sampai hari pernikahanmu.
          </h1>
          <p className="max-w-lg text-foreground/75">
            Makeup artist panggilan ke lokasimu. Harga jelas per orang mulai{" "}
            {formatRupiah(lowestPrice(serviceGroups))}, sudah termasuk
            bulu mata dan hijab do.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a
              href={whatsappUrl("hero")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full bg-accent-strong px-6 py-3 font-medium text-white transition-colors hover:bg-foreground"
            >
              <ChatIcon />
              Chat WhatsApp
            </a>
            <Link
              href="/portfolio"
              className="rounded-full border border-line bg-surface px-6 py-3 text-center font-medium transition-colors hover:border-accent"
            >
              Lihat portofolio
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-accent-soft">
          <Image
            src={about.photoUrl}
            alt={about.photoAlt}
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            // Foto hero = elemen terbesar di layar (LCP), jadi dimuat paling awal.
            preload
            className="object-cover"
          />
        </div>
      </section>

      {/* Portofolio pilihan */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Portofolio" title="Hasil riasan pilihan" />
          <Link href="/portfolio" className="flex items-center gap-1 text-sm font-medium text-accent-strong">
            Lihat semua <ArrowRightIcon />
          </Link>
        </div>
        <div className="mt-6">
          <FeaturedPortfolio items={featured} />
        </div>
      </section>

      {/* Ringkasan layanan */}
      <section className="bg-accent-soft/40 py-12">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Layanan & Harga"
              title="Harga jelas, tanpa tanya-tanya"
              description="Harga per orang. Semua sudah termasuk bulu mata dan hijab do simple."
            />
            <Link href="/layanan" className="flex items-center gap-1 text-sm font-medium text-accent-strong">
              Lihat price list lengkap <ArrowRightIcon />
            </Link>
          </div>

          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {highlightGroups.map((group) => (
              <li key={group.id}>
                <Link
                  href="/layanan"
                  className="flex h-full flex-col rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent sm:p-6"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent-strong">
                    {group.tier === "premium" ? "Premium" : "Reguler"}
                  </p>
                  <h3 className="mt-1 font-heading text-2xl font-semibold">{group.name}</h3>
                  <p className="mt-2 text-sm text-foreground/70">
                    mulai{" "}
                    <span className="text-lg font-semibold text-foreground">
                      {formatRupiah(Math.min(...group.items.map((i) => i.price)))}
                    </span>
                  </p>
                  <p className="mt-3 text-sm text-foreground/75">
                    {group.items
                      .slice(0, 3)
                      .map((i) => i.name)
                      .join(" · ")}
                  </p>
                  <ul className="mt-4 space-y-1 border-t border-line pt-4 text-sm text-foreground/75">
                    {group.includes.map((include) => (
                      <li key={include} className="flex items-center gap-1.5">
                        <CheckIcon className="h-4 w-4 text-accent-strong" />
                        {include}
                      </li>
                    ))}
                  </ul>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Testimoni: kosong di production selama datanya masih dummy */}
      {testimonials.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
          <SectionHeading eyebrow="Testimoni" title="Kata mereka" />
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <li key={t.id}>
                <TestimonialCard testimonial={t} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mx-auto w-full max-w-6xl px-4 pt-4 pb-14 sm:px-6">
        <WhatsAppCta
          source="home-cta"
          title="Siap tampil flawless?"
          description="Kirim tanggal, lokasi, dan jenis acaramu. Jadwal dicek dan dibalas secepatnya."
        />
      </div>
    </>
  );
}
