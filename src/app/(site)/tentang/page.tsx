import type { Metadata } from "next";
import Image from "next/image";
import BrandLogos from "@/components/BrandLogos";
import SectionHeading from "@/components/SectionHeading";
import WhatsAppCta from "@/components/WhatsAppCta";
import { PinIcon } from "@/components/icons";
import { about } from "@/data/about";
import { bookingInfo, brands } from "@/data/services";
import { site } from "@/data/site";
import { formatRupiah } from "@/lib/format";
import { getServiceGroups, lowestPrice } from "@/lib/prices";
import { getProfile } from "@/lib/profile";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return {
    title: "Tentang",
    description: `Kenalan dengan ${site.name}: makeup artist wisuda, pesta, dan acara pernikahan di ${profile.serviceAreas.join(", ")}.`,
  };
}

export default async function TentangPage() {
  const [serviceGroups, profile] = await Promise.all([getServiceGroups(), getProfile()]);
  // Sorotan dihitung dari data asli, bukan angka karangan.
  const allItems = serviceGroups.flatMap((g) => g.items);
  const highlights = [
    { value: String(allItems.length), label: "jenis layanan" },
    { value: String(brands.length), label: "brand produk" },
    { value: formatRupiah(lowestPrice(serviceGroups)), label: "harga mulai" },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-accent-soft">
          <Image
            src={about.photoUrl}
            alt={about.photoAlt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            loading="eager"
            className="object-cover"
          />
        </div>

        <div>
          <SectionHeading as="h1" eyebrow={`Tentang ${site.name}`} title={profile.greeting} />
          <div className="mt-4 space-y-4 text-foreground/80">
            {profile.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <dl className="mt-8 grid grid-cols-3 gap-3">
            {highlights.map((h) => (
              <div key={h.label} className="rounded-xl border border-line bg-surface px-3 py-4 text-center">
                <dt className="sr-only">{h.label}</dt>
                <dd className="font-heading text-2xl sm:text-3xl">{h.value}</dd>
                <dd className="mt-1 text-xs text-foreground/70">{h.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Product used"
          title="Brand yang aku pakai"
          description="Produk lokal dan internasional yang sudah teruji untuk riasan tahan lama."
        />
        <div className="mt-6">
          <BrandLogos brands={brands} />
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading eyebrow="Area layanan" title="Aku datang ke lokasimu" />
        <ul className="mt-6 flex flex-wrap gap-2">
          {profile.serviceAreas.map((area) => (
            <li key={area} className="flex items-center gap-2 rounded-full bg-accent-soft px-4 py-2 text-sm">
              <PinIcon className="h-4 w-4 text-accent-strong" />
              {area}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-foreground/70">{bookingInfo.transport}</p>
      </section>

      <div className="mt-16">
        <WhatsAppCta
          source="tentang"
          title="Yuk, cek jadwal kosong"
          description="Kirim tanggal, lokasi, dan jenis acaramu lewat WhatsApp."
        />
      </div>
    </div>
  );
}
