import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import ServiceGroupCard from "@/components/ServiceGroupCard";
import WhatsAppCta from "@/components/WhatsAppCta";
import { addOns, bookingInfo, serviceGroups, terms } from "@/data/services";
import { formatRupiah } from "@/lib/format";

export const metadata: Metadata = {
  title: "Layanan & Harga",
  description:
    "Price list 2026 makeup wisuda, pagar ayu, pesta, lamaran, siraman, pengajian, dan akad. Harga per orang, termasuk bulu mata dan hijab do.",
};

export default function LayananPage() {
  const groups = [...serviceGroups].sort((a, b) => a.order - b.order);
  const lowestPrice = Math.min(...groups.flatMap((g) => g.items.map((i) => i.price)));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading
        as="h1"
        eyebrow="Price list 2026"
        title="Layanan & Harga"
        description={`Harga per orang, mulai ${formatRupiah(lowestPrice)}. Ketuk salah satu layanan untuk langsung booking lewat WhatsApp.`}
      />

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {groups.map((group) => (
          <ServiceGroupCard key={group.id} group={group} />
        ))}
      </div>

      <section aria-labelledby="tambahan" className="mt-12">
        <h2 id="tambahan" className="font-heading text-2xl font-semibold">
          Tambahan
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {addOns.map((addOn) => (
            <li key={addOn.id} className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface px-5 py-4">
              <div>
                <p className="font-medium">{addOn.name}</p>
                {addOn.note && <p className="text-sm text-foreground/70">{addOn.note}</p>}
              </div>
              <p className="font-semibold tabular-nums">
                {formatRupiah(addOn.priceFrom)}
                {addOn.priceTo && `–${formatRupiah(addOn.priceTo)}`}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="ketentuan" className="mt-12 grid gap-6 md:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 id="ketentuan" className="font-heading text-2xl font-semibold">
            Booking & pembayaran
          </h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-semibold">Transport</dt>
              <dd className="mt-1 text-foreground/75">{bookingInfo.transport}</dd>
            </div>
            <div>
              <dt className="font-semibold">DP</dt>
              <dd className="mt-1 text-foreground/75">{bookingInfo.deposit}</dd>
            </div>
            <div>
              <dt className="font-semibold">Pelunasan</dt>
              <dd className="mt-1 text-foreground/75">{bookingInfo.payment}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
          <h3 className="font-semibold">Syarat & ketentuan</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground/75 marker:text-accent">
            {terms.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mt-14">
        <WhatsAppCta
          source="layanan-cta"
          title="Bingung pilih yang mana?"
          description="Ceritakan acaramu, tanggal, dan lokasinya. Nanti dibantu pilihkan layanan yang paling pas."
          message="Halo Kak, saya mau konsultasi pilihan makeup untuk acara saya."
        />
      </div>
    </div>
  );
}
