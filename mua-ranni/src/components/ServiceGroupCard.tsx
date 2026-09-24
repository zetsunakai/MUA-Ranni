import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import { formatRupiah } from "@/lib/format";
import { whatsappUrl } from "@/lib/whatsapp";
import type { ServiceGroup } from "@/types";

// Setiap baris layanan adalah link WhatsApp dengan pesan yang sudah menyebut
// nama layanan dan harganya, jadi klien tidak perlu mengetik ulang.
export default function ServiceGroupCard({ group }: { group: ServiceGroup }) {
  const premium = group.tier === "premium";

  return (
    <article
      className={`flex flex-col rounded-xl border bg-surface p-5 sm:p-6 ${
        premium ? "border-accent" : "border-line"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-2xl font-semibold">{group.name}</h2>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
            premium ? "bg-accent-strong text-white" : "bg-accent-soft text-accent-strong"
          }`}
        >
          {premium ? "Premium" : "Reguler"}
        </span>
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground/75">
        {group.includes.map((include) => (
          <li key={include} className="flex items-center gap-1.5">
            <CheckIcon className="h-4 w-4 text-accent-strong" />
            {include}
          </li>
        ))}
      </ul>

      <ul className="mt-4 divide-y divide-line border-t border-line">
        {group.items.map((item) => (
          <li key={item.id}>
            <a
              href={whatsappUrl(
                `Halo Kak, saya mau booking makeup ${group.name} - ${item.name} (${formatRupiah(item.price)}) untuk tanggal ... di ...`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-accent-soft/50"
            >
              <span className="flex-1">{item.name}</span>
              <span className="font-semibold tabular-nums">{formatRupiah(item.price)}</span>
              <span className="flex items-center gap-1 text-xs font-medium text-accent-strong">
                <span className="sr-only sm:not-sr-only">Booking</span>
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}
