import type { Metadata } from "next";
import { ArrowRightIcon } from "@/components/icons";
import { bookingInfo, terms } from "@/data/services";
import { formatRupiah } from "@/lib/format";
import { getAddOns, getServiceGroups, lowestPrice } from "@/lib/prices";
import { whatsappUrl } from "@/lib/whatsapp";
import type { ServiceGroup } from "@/types";

export const metadata: Metadata = {
  title: "Layanan & Harga",
  description:
    "Price list 2026 makeup wisuda, pagar ayu, pesta, lamaran, siraman, pengajian, dan akad. Harga per orang, termasuk bulu mata dan hijab do.",
};

// Harga dibaca dari database saat build, lalu halaman disimpan sebagai HTML statis.
// Setelah admin menyimpan harga baru, revalidatePath("/layanan") membuat ulang halaman ini.
export default async function LayananPage() {
  const [groups, addOns] = await Promise.all([getServiceGroups(), getAddOns()]);
  const booking = [
    { label: "Transport", text: bookingInfo.transport },
    { label: "DP", text: bookingInfo.deposit },
    { label: "Pelunasan", text: bookingInfo.payment },
  ];

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-14 sm:px-6 md:pt-24 md:pb-28">
        <div className="max-w-4xl">
          <p className="text-xs font-semibold tracking-[0.25em] text-accent-strong uppercase">Price list 2026</p>
          <h1 className="mt-4 font-heading text-[56px] leading-[0.95] tracking-tight md:mt-5 md:text-8xl">
            Harga jelas, <em>per&nbsp;orang.</em>
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted md:mt-5 md:text-lg">
            Mulai {formatRupiah(lowestPrice(groups))} per orang. Ketuk salah satu layanan untuk langsung booking lewat
            WhatsApp.
          </p>
        </div>

        <ul className="mt-10 border-t border-foreground md:mt-16">
          {groups.map((group) => (
            <GroupBlock key={group.id} group={group} />
          ))}

          {addOns.length > 0 && (
            <li className="grid gap-5 border-b border-line py-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:py-12">
              <div>
                <h2 className="font-heading text-[36px] leading-none md:text-5xl">Tambahan</h2>
                <p className="mt-3 text-sm text-muted md:text-[15px]">Bisa ditambahkan ke layanan apa pun.</p>
              </div>
              <ul className="md:-mt-4">
                {addOns.map((addOn) => (
                  <li
                    key={addOn.id}
                    className="flex items-center gap-4 border-b border-line py-4 last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="text-[15px] md:text-[17px]">{addOn.name}</p>
                      {addOn.note && <p className="text-[13px] text-muted">{addOn.note}</p>}
                    </div>
                    <p className="text-right font-heading text-2xl leading-none tabular-nums md:text-[28px]">
                      {formatRupiah(addOn.priceFrom)}
                      {addOn.priceTo && `–${formatRupiah(addOn.priceTo)}`}
                    </p>
                  </li>
                ))}
              </ul>
            </li>
          )}
        </ul>
      </div>

      <section aria-labelledby="ketentuan" className="bg-accent-soft">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 md:py-28">
          <p className="text-xs font-semibold tracking-[0.25em] text-accent-strong uppercase">Sebelum booking</p>
          <h2 id="ketentuan" className="mt-4 font-heading text-[40px] leading-none md:text-[64px]">
            Booking &amp; <em>pembayaran.</em>
          </h2>

          <div className="mt-8 grid gap-10 md:mt-14 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
            <dl className="grid gap-6">
              {booking.map((b) => (
                <div key={b.label} className="border-t border-foreground pt-4">
                  <dt className="font-heading text-[26px] leading-tight md:text-[32px]">{b.label}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted md:text-base">{b.text}</dd>
                </div>
              ))}
            </dl>

            <div className="border-t border-foreground pt-4">
              <h3 className="font-heading text-[26px] leading-tight md:text-[32px]">Syarat &amp; ketentuan</h3>
              <ol className="mt-4">
                {terms.map((term, i) => (
                  <li key={term} className="flex gap-4 border-b border-line py-3 text-sm leading-relaxed last:border-b-0 md:text-[15px]">
                    <span aria-hidden="true" className="w-5 shrink-0 font-heading text-xl leading-none text-accent-strong">
                      {i + 1}
                    </span>
                    <span className="text-muted">{term}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}

// Satu grup harga: nama & isi paket di kiri, daftar layanan di kanan.
// Setiap baris layanan adalah link WhatsApp dengan pesan yang sudah menyebut
// nama layanan dan harganya, jadi klien tidak perlu mengetik ulang.
function GroupBlock({ group }: { group: ServiceGroup }) {
  const premium = group.tier === "premium";

  return (
    <li
      id={group.id}
      className="grid scroll-mt-24 gap-5 border-b border-line py-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:py-12"
    >
      <div>
        <span
          className={`inline-block rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.15em] uppercase ${
            premium ? "bg-accent-strong text-white" : "border border-foreground/40"
          }`}
        >
          {premium ? "Premium" : "Reguler"}
        </span>
        <h2 className="mt-4 font-heading text-[36px] leading-none md:text-5xl">{group.name}</h2>
        <p className="mt-3 text-sm text-muted md:text-[15px]">Termasuk: {group.includes.join(" · ")}</p>
      </div>

      <ul className="md:-mt-4">
        {group.items.map((item) => (
          <li key={item.id} className="border-b border-line last:border-b-0">
            <a
              href={whatsappUrl(
                "layanan",
                `Halo Kak, saya mau booking makeup ${group.name} - ${item.name} (${formatRupiah(item.price)}) untuk tanggal ... di ...`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Booking ${item.name}, ${formatRupiah(item.price)}, lewat WhatsApp`}
              className="group flex items-center gap-4 py-4 transition-colors hover:text-accent-strong"
            >
              <span className="flex-1 text-[15px] md:text-[17px]">{item.name}</span>
              <span className="font-heading text-2xl leading-none tabular-nums md:text-[28px]">
                {formatRupiah(item.price)}
              </span>
              <ArrowRightIcon className="h-4 w-4 shrink-0 text-accent-strong transition-transform group-hover:translate-x-0.5" />
            </a>
          </li>
        ))}
      </ul>
    </li>
  );
}
