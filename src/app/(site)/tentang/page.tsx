import type { Metadata } from "next";
import Image from "next/image";
import BrandLogos from "@/components/BrandLogos";
import { ChatIcon } from "@/components/icons";
import { about } from "@/data/about";
import { bookingInfo, brands } from "@/data/services";
import { site } from "@/data/site";
import { getProfile } from "@/lib/profile";
import { whatsappUrl } from "@/lib/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return {
    title: "Tentang",
    description: `Kenalan dengan ${site.name}: makeup artist wisuda, pesta, dan acara pernikahan di ${profile.serviceAreas.join(", ")}.`,
  };
}

// Isi mengikuti paket yang berlaku untuk semua layanan (lihat REGULER/PREMIUM_INCLUDES
// di data/services.ts) dan layanan home service. Ubah di sini kalau paketnya berubah.
const approach = [
  {
    title: "Menyesuaikan wajah & busana",
    text: "Riasan dibuat mengikuti karakter wajah dan warna busanamu, bukan satu gaya untuk semua.",
  },
  { title: "Datang ke tempatmu", text: "Kamu cukup bersiap di rumah, kos, atau venue." },
  {
    title: "Sampai hijab rapi",
    text: "Bulu mata dan hijab do simple sudah termasuk, jadi tampilan selesai utuh.",
  },
];

export default async function TentangPage() {
  const profile = await getProfile();
  const [lead, ...rest] = profile.bio;

  return (
    <>
      <section className="mx-auto grid w-full max-w-6xl items-center gap-6 px-5 pt-8 pb-14 sm:px-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-16 md:pt-24 md:pb-28 lg:gap-24">
        {/* Foto berbentuk lengkung, sama seperti di Home */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-lg bg-sand md:aspect-[13/17]">
          <Image
            src={about.photoUrl}
            alt={about.photoAlt}
            fill
            sizes="(min-width: 1152px) 460px, (min-width: 768px) 42vw, 100vw"
            preload
            className="object-cover"
          />
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.25em] text-accent-strong uppercase">Tentang</p>
          <h1 className="mt-4 font-heading text-[60px] leading-[0.95] tracking-tight md:mt-7 md:text-8xl">
            <Greeting text={profile.greeting} />
          </h1>
          {lead && <p className="mt-5 text-[17px] leading-relaxed md:mt-7 md:text-xl">{lead}</p>}
          {rest.map((paragraph) => (
            <p key={paragraph} className="mt-4 text-[15px] leading-relaxed text-muted md:mt-5 md:text-[17px]">
              {paragraph}
            </p>
          ))}
          <div className="mt-6 flex flex-col gap-4 md:mt-9 md:flex-row md:items-center">
            <a
              href={whatsappUrl("tentang")}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-accent-strong px-7 py-4 text-center font-medium text-white transition-colors hover:bg-foreground"
            >
              Chat WhatsApp
            </a>
            <a
              href={profile.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden font-medium underline underline-offset-4 hover:text-accent-strong md:inline"
            >
              Instagram @{profile.instagramHandle}
            </a>
          </div>
        </div>
      </section>

      <section className="bg-accent-soft">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 md:py-28">
          <h2 className="font-heading text-[40px] leading-none md:text-[64px]">Cara aku merias</h2>
          <ul className="mt-6 grid gap-6 md:mt-14 md:grid-cols-3 md:gap-12">
            {approach.map((item) => (
              <li key={item.title} className="border-t border-foreground pt-4 md:pt-6">
                <h3 className="font-heading text-[26px] leading-tight md:text-[32px]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted md:mt-3.5 md:text-base">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-14 sm:px-6 md:grid-cols-2 md:gap-16 md:py-28 lg:gap-24">
        <div>
          <h2 className="text-xs font-semibold tracking-[0.25em] text-accent-strong uppercase">Area layanan</h2>
          <ul className="mt-4 font-heading text-5xl leading-[1.05] md:mt-6 md:text-7xl">
            {profile.serviceAreas.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted md:mt-6 md:text-base">{profile.responseHours}</p>
          <p className="mt-1 text-sm text-muted md:text-base">{bookingInfo.transport}</p>
        </div>

        <div>
          <h2 className="text-xs font-semibold tracking-[0.25em] text-accent-strong uppercase">Produk yang dipakai</h2>
          <div className="mt-4 md:mt-6">
            <BrandLogos brands={brands} />
          </div>
        </div>
      </section>

      {/* Ajakan chat, menyambung ke footer gelap */}
      <section className="bg-foreground text-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pt-12 pb-12 sm:px-6 md:flex-row md:items-center md:justify-between md:pt-20">
          <h2 className="font-heading text-[44px] leading-none md:text-7xl">
            Yuk, <em>kenalan dulu.</em>
          </h2>
          <a
            href={whatsappUrl("tentang-cta")}
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

// Sapaan diisi admin (mis. "Halo, aku Ranni"). Kata terakhir dibuat miring seperti di desain,
// dan diberi titik kalau belum ada tanda baca di akhir.
function Greeting({ text }: { text: string }) {
  const trimmed = text.trim();
  const ending = /[.!?]$/.test(trimmed) ? "" : ".";
  const cut = trimmed.lastIndexOf(" ");
  if (cut === -1) return <em>{trimmed + ending}</em>;
  return (
    <>
      {trimmed.slice(0, cut)} <em>{trimmed.slice(cut + 1) + ending}</em>
    </>
  );
}
