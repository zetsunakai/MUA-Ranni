import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, ChatIcon } from "@/components/icons";
import { bookingInfo } from "@/data/services";
import { site } from "@/data/site";
import { getProfile } from "@/lib/profile";
import { whatsappUrl } from "@/lib/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return {
    title: "Kontak",
    description: `Booking ${site.name} lewat WhatsApp ${profile.whatsappDisplay}. Area layanan ${profile.serviceAreas.join(", ")}.`,
  };
}

const bookingSteps = [
  { title: "Chat WhatsApp", text: "Kirim tanggal, jam, lokasi, dan jenis makeup." },
  { title: "Bayar DP", text: bookingInfo.deposit },
  { title: "Pelunasan", text: bookingInfo.payment },
];

export default async function KontakPage() {
  const profile = await getProfile();

  // Baris kontak: yang punya href bisa diketuk, sisanya informasi saja.
  const contacts: { label: string; value: string; href?: string }[] = [
    { label: "WhatsApp", value: profile.whatsappDisplay, href: whatsappUrl("kontak") },
    { label: "Instagram", value: `@${profile.instagramHandle}`, href: profile.instagramUrl },
    ...(profile.tiktokUrl && profile.tiktokHandle
      ? [{ label: "TikTok", value: `@${profile.tiktokHandle}`, href: profile.tiktokUrl }]
      : []),
    { label: "Area layanan", value: profile.serviceAreas.join(" · ") },
    { label: "Jam respon chat", value: profile.responseHours },
  ];

  return (
    <>
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 pt-10 pb-14 sm:px-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:pt-24 md:pb-28">
        <div className="md:sticky md:top-32 md:self-start">
          <p className="text-xs font-semibold tracking-[0.25em] text-accent-strong uppercase">Kontak</p>
          <h1 className="mt-4 font-heading text-[56px] leading-[0.95] tracking-tight md:mt-5 md:text-8xl">
            Booking lewat <em>WhatsApp.</em>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted md:mt-5 md:text-lg">
            Cara tercepat adalah lewat WhatsApp. Sertakan tanggal dan lokasi acara supaya bisa langsung dicek jadwalnya.
          </p>
          <a
            href={whatsappUrl("kontak")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center justify-center gap-2 rounded-full bg-accent-strong px-7 py-4 font-medium text-white transition-colors hover:bg-foreground md:mt-8 md:inline-flex"
          >
            <ChatIcon />
            Chat WhatsApp
          </a>
        </div>

        <dl className="border-t border-foreground">
          {contacts.map((c) => (
            <div key={c.label} className="border-b border-line py-5 md:py-6">
              <dt className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">{c.label}</dt>
              <dd className="mt-2">
                {c.href ? (
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 font-heading text-[28px] leading-tight transition-colors hover:text-accent-strong md:text-[40px]"
                  >
                    <span className="min-w-0 [overflow-wrap:anywhere]">{c.value}</span>
                    <ArrowRightIcon className="h-5 w-5 shrink-0 text-accent-strong transition-transform group-hover:translate-x-1" />
                  </a>
                ) : (
                  <span className="font-heading text-[28px] leading-tight md:text-[40px]">{c.value}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <section aria-labelledby="cara-booking" className="bg-accent-soft">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 md:py-28">
          <p className="text-xs font-semibold tracking-[0.25em] text-accent-strong uppercase">Cara booking</p>
          <h2 id="cara-booking" className="mt-4 font-heading text-[40px] leading-none md:text-[64px]">
            Tiga langkah, <em>jadwal aman.</em>
          </h2>
          <ol className="mt-8 grid md:mt-14 md:grid-cols-3 md:gap-12">
            {bookingSteps.map((s, i) => (
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
          <p className="mt-6 text-[15px] text-muted md:mt-8">
            Pertanyaan soal DP, cancel, atau persiapan?{" "}
            <Link href="/faq" className="font-medium text-accent-strong underline underline-offset-4">
              Lihat FAQ
            </Link>
          </p>
        </div>
      </section>

      {/* Ajakan cek jadwal, menyambung ke footer gelap */}
      <section className="bg-foreground text-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pt-12 pb-12 sm:px-6 md:flex-row md:items-end md:justify-between md:pt-20">
          <div>
            <h2 className="font-heading text-[44px] leading-none md:text-7xl">
              Cek tanggal <em>kosong dulu?</em>
            </h2>
            <p className="mt-5 max-w-md text-[15px] text-background/80 md:text-[17px]">
              Lihat tanggal yang masih tersedia, lalu kirim detail acaramu dari halaman Jadwal.
            </p>
          </div>
          <Link
            href="/jadwal"
            className="flex items-center justify-center gap-2 rounded-full bg-background px-8 py-4 font-medium text-foreground transition-colors hover:bg-accent-soft md:shrink-0"
          >
            Lihat jadwal
            <ArrowRightIcon />
          </Link>
        </div>
      </section>
    </>
  );
}
