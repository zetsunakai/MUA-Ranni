import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import PortfolioBento from "@/components/home/PortfolioBento";
import TestimonialSlider from "@/components/home/TestimonialSlider";
import { ChatIcon } from "@/components/icons";
import { about } from "@/data/about";
import { eventHighlights } from "@/data/site";
import { getCategories } from "@/lib/categories";
import { formatRupiah, formatRupiahShort } from "@/lib/format";
import { getPortfolioItems } from "@/lib/portfolio";
import { getServiceGroups } from "@/lib/prices";
import { getProfile } from "@/lib/profile";
import { getPublicTestimonials } from "@/lib/testimonials";
import { whatsappUrl } from "@/lib/whatsapp";

// Grup yang diringkas di Home. Kalau grup ini dihapus/diganti admin, pakai 3 grup pertama.
const HIGHLIGHT_GROUPS = ["reguler-dewasa", "premium-dewasa", "premium-pernikahan"];

const steps = [
  { title: "Kirim detail acara", text: "Tanggal, lokasi, dan jenis acaramu lewat WhatsApp." },
  { title: "Cek jadwal & pilih paket", text: "Jadwal dicek dan dibalas secepatnya, lalu tentukan paket yang pas." },
  { title: "Tinggal tampil", text: "Di hari H, riasan dikerjakan langsung di tempatmu bersiap." },
];

// Label area singkat di hero dan badge "Home service". Sengaja hanya "Bogor"
// (daftar area lengkap tetap tampil di Tentang, Kontak, FAQ, dan footer).
const HOME_AREA_LABEL = "Bogor";

export default async function Home() {
  const [serviceGroups, portfolioItems, categories, profile, testimonials] = await Promise.all([
    getServiceGroups(),
    getPortfolioItems(),
    getCategories(),
    getProfile(),
    getPublicTestimonials(),
  ]);

  const highlighted = serviceGroups.filter((g) => HIGHLIGHT_GROUPS.includes(g.id));
  const groups = (highlighted.length ? highlighted : serviceGroups).slice(0, 3);
  const secondPhoto = portfolioItems.find((i) => i.featured) ?? portfolioItems[0];
  const trustPoints = ["Datang ke lokasimu", "Bulu mata & hijab do termasuk", profile.responseHours.replace(/\s*WIB$/, "")];

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid w-full max-w-6xl gap-12 px-5 pt-10 pb-16 sm:px-6 md:grid-cols-[1.1fr_1fr] md:items-start md:gap-10 md:pt-20 md:pb-24">
        <div>
          <Eyebrow>
            Wisuda · Pesta · Pernikahan<span className="hidden md:inline"> — {HOME_AREA_LABEL}</span>
          </Eyebrow>
          <h1 className="mt-6 font-heading text-[56px] leading-[0.95] tracking-tight md:text-8xl">
            Hari istimewamu,
            <br />
            <em className="text-accent-strong">tampilan</em>
            <br />
            terbaikmu.
          </h1>
          <p className="mt-8 max-w-md text-[17px] leading-relaxed text-muted md:text-lg">
            Makeup untuk pernikahan, wisuda, dan setiap momen yang ingin kamu kenang selamanya. Riasan disesuaikan
            dengan wajah dan busanamu, dikerjakan langsung di lokasimu.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappUrl("hero")}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-accent-strong px-7 py-4 text-center font-medium text-white transition-colors hover:bg-foreground"
            >
              Chat WhatsApp
            </a>
            <Link
              href="/portfolio"
              className="rounded-full border border-foreground px-7 py-4 text-center font-medium transition-colors hover:bg-foreground hover:text-background"
            >
              Lihat portofolio
            </Link>
          </div>
          <ul className="mt-10 hidden flex-wrap gap-x-8 gap-y-2 border-t border-line pt-6 text-sm text-muted md:flex">
            {trustPoints.map((p) => (
              <li key={p} className="whitespace-nowrap">
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Foto: arch besar (foto Ranni) + foto kecil bertumpuk + lencana bulat */}
        <div className="relative mx-auto aspect-[44/65] w-full max-w-[440px] md:mt-2 md:mr-0">
          <div className="absolute inset-y-0 right-0 left-[14%] overflow-hidden rounded-t-full rounded-b-lg bg-sand">
            <Image src={about.photoUrl} alt={about.photoAlt} fill preload sizes="(min-width: 768px) 380px, 80vw" className="object-cover" />
          </div>
          {secondPhoto && (
            <div className="absolute bottom-[-6%] left-0 w-[46%] overflow-hidden border-[6px] border-background bg-accent-soft md:w-[52%]">
              <div className="relative aspect-[3/4]">
                <Image
                  src={secondPhoto.imageUrl}
                  alt={`${secondPhoto.title}, riasan ${secondPhoto.categoryLabel}`}
                  fill
                  sizes="(min-width: 768px) 220px, 40vw"
                  className="object-cover"
                />
              </div>
            </div>
          )}
          <div className="absolute top-[8%] left-0 flex h-[118px] w-[118px] flex-col items-center justify-center rounded-full bg-foreground text-center text-background md:h-[150px] md:w-[150px] md:-translate-x-1/4">
            <span className="font-heading text-[22px] leading-none italic md:text-[28px]">
              Home
              <br />
              service
            </span>
            <span className="mt-2 text-[9px] tracking-[0.25em] uppercase md:text-[10px]">{HOME_AREA_LABEL}</span>
          </div>
        </div>

        <ul className="space-y-2 border-t border-line pt-6 text-sm text-muted md:hidden">
          {trustPoints.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>

      {/* Band gelap jenis acara */}
      <section aria-label="Jenis acara" className="bg-foreground text-background">
        <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-5 gap-y-1 px-5 py-6 font-heading text-[28px] italic md:justify-between md:py-9 md:text-[40px]">
          {eventHighlights.map((e, i) => (
            <li key={e} className="flex items-center gap-5">
              {e}
              {/* Titik setelah kata (bukan sebelum), supaya baris di HP tidak diawali titik. */}
              {i < eventHighlights.length - 1 && <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent" />}
            </li>
          ))}
        </ul>
      </section>

      {/* 01 Portofolio */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 md:py-24">
        <div className="md:flex md:items-end md:justify-between md:gap-8">
          <div>
            <Eyebrow>01 — Portofolio</Eyebrow>
            <SectionTitle>Hasil riasan pilihan</SectionTitle>
          </div>
        </div>
        <div className="mt-8">
          <PortfolioBento items={portfolioItems} categories={categories} />
        </div>
        <Link href="/portfolio" className="mt-10 inline-block text-[15px] font-medium text-accent-strong underline underline-offset-4">
          Lihat semua portofolio →
        </Link>
      </section>

      {/* 02 Layanan & Harga */}
      <section className="border-t border-line">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 sm:px-6 md:grid-cols-[1fr_1.35fr] md:gap-16 md:py-24">
          <div>
            <Eyebrow>02 — Layanan & Harga</Eyebrow>
            <SectionTitle>Harga jelas, tanpa tanya-tanya.</SectionTitle>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-muted">
              Pilih paket, lalu lanjutkan ke WhatsApp untuk cek jadwal.
            </p>
            <Link href="/layanan" className="mt-5 hidden text-[15px] font-medium text-accent-strong underline underline-offset-4 md:inline-block">
              Lihat price list lengkap →
            </Link>
          </div>

          <div>
            <ul className="border-t border-foreground">
              {groups.map((g) => {
                const from = Math.min(...g.items.map((i) => i.price));
                return (
                  <li key={g.id} className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-line py-7">
                    <h3 className="font-heading text-[32px] leading-tight md:text-[40px]">{g.name}</h3>
                    <p className="self-center text-right text-sm font-semibold md:hidden">{formatRupiahShort(from)}</p>
                    <div className="hidden text-right md:row-span-3 md:block">
                      <p className="text-xs text-muted">mulai</p>
                      <p className="font-heading text-5xl">{formatRupiah(from)}</p>
                      <PickLink group={g.name} />
                    </div>
                    <p className="col-span-2 mt-2 text-[15px] text-muted md:col-span-1">
                      {g.items
                        .slice(0, 3)
                        .map((i) => i.name)
                        .join(" · ")}
                    </p>
                    <p className="col-span-2 mt-2 text-sm md:col-span-1">{g.includes.join(" · ")}</p>
                    <div className="col-span-2 mt-3 md:hidden">
                      <PickLink group={g.name} />
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 text-xs text-muted md:hidden">Harga mulai dari, per orang.</p>
            <Link href="/layanan" className="mt-4 inline-block text-[15px] font-medium text-accent-strong underline underline-offset-4 md:hidden">
              Lihat price list lengkap →
            </Link>
          </div>
        </div>
      </section>

      {/* 03 Cara booking */}
      <section className="bg-accent-soft">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 md:py-24">
          <Eyebrow>03 — Cara booking</Eyebrow>
          <SectionTitle>Tiga langkah, jadwal aman.</SectionTitle>
          <ol className="mt-10 grid md:grid-cols-3 md:gap-12">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-6 border-t border-foreground py-6 md:block md:pt-6">
                <span aria-hidden="true" className="w-10 shrink-0 font-heading text-6xl leading-none text-accent-strong md:w-auto md:text-[80px]">
                  {i + 1}
                </span>
                <div className="md:mt-6">
                  <h3 className="text-xl font-medium md:text-[22px]">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 04 Testimoni: muncul otomatis begitu ada testimoni yang disetujui */}
      {testimonials.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 md:py-24">
          <Eyebrow>04 — Kata klien</Eyebrow>
          <div className="mt-8">
            <TestimonialSlider testimonials={testimonials} />
          </div>
        </section>
      )}

      {/* Ajakan chat, menyambung ke footer gelap */}
      <section className="bg-foreground text-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pt-16 pb-12 sm:px-6 md:flex-row md:items-end md:justify-between md:pt-24">
          <div>
            <h2 className="font-heading text-[56px] leading-[0.95] md:text-8xl">
              Siap tampil <em>flawless?</em>
            </h2>
            <p className="mt-5 max-w-md text-[17px] text-background/80">
              Kirim tanggal, lokasi, dan jenis acaramu. Jadwal dicek dan dibalas secepatnya.
            </p>
          </div>
          <a
            href={whatsappUrl("home-cta")}
            target="_blank"
            rel="noopener noreferrer"
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

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold tracking-[0.25em] text-accent-strong uppercase">{children}</p>;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mt-4 font-heading text-[44px] leading-[1.02] md:text-[64px]">{children}</h2>;
}

function PickLink({ group }: { group: string }) {
  return (
    <a
      href={whatsappUrl("layanan", `Halo Kak, saya mau tanya paket ${group}. Acaranya tanggal ... di ...`)}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 inline-block text-sm font-medium text-accent-strong underline underline-offset-4"
    >
      Pilih paket →
    </a>
  );
}
