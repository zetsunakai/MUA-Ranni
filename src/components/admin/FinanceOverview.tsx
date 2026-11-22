import Link from "next/link";
import { formatLongDate, formatMonth } from "@/lib/dates";
import { formatRupiah } from "@/lib/format";
import type { getFinanceReport } from "@/lib/reports";

type Report = NonNullable<Awaited<ReturnType<typeof getFinanceReport>>>;

// Ringkasan keuangan di halaman Ringkasan admin.
export default function FinanceOverview({ report }: { report: Report }) {
  const { current, monthly, receivable, unpaid, upcoming } = report;
  const tiles = [
    { label: "Pemasukan", value: current.income, href: "/admin/booking" },
    { label: "Belanja", value: current.spending, href: `/admin/belanja?bulan=${current.month}` },
    { label: "Laba", value: current.profit, href: undefined },
    { label: "Piutang", value: receivable, href: "/admin/booking?status=confirmed", note: `${unpaid.length} booking belum lunas` },
  ];

  return (
    <section className="space-y-6" aria-labelledby="finance-heading">
      <div className="admin-panel-heading">
        <div>
          <p className="editorial-label">Keuangan</p>
          <h2 id="finance-heading" className="font-heading">{formatMonth(current.month)}</h2>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((tile) => {
          const body = (
            <>
              <span className="editorial-label">{tile.label}</span>
              <strong className={`mt-3 block font-heading text-3xl font-normal tabular-nums ${tile.value < 0 ? "text-red-700" : ""}`}>
                {tile.value < 0 ? `−${formatRupiah(-tile.value)}` : formatRupiah(tile.value)}
              </strong>
              {tile.note && <span className="mt-1 block text-xs text-foreground/60">{tile.note}</span>}
            </>
          );
          return (
            <li key={tile.label} className={tile.label === "Laba" ? "bg-foreground text-background [&_.editorial-label]:text-[#e1c296]" : "bg-accent-soft"}>
              {tile.href ? <Link href={tile.href} className="block h-full p-5 hover:opacity-80">{body}</Link> : <div className="p-5">{body}</div>}
            </li>
          );
        })}
      </ul>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-line bg-surface p-5">
          <h3 className="font-heading text-2xl">Belum lunas</h3>
          {unpaid.length === 0 ? (
            <p className="mt-3 text-sm text-foreground/70">Semua booking sudah lunas.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {unpaid.slice(0, 6).map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/booking/${b.id}`} className="flex justify-between gap-3 py-3 text-sm hover:bg-accent-soft">
                    <span className="min-w-0">
                      <span className="block font-medium">{b.clientName}</span>
                      <span className="text-foreground/60">{formatLongDate(b.eventDate)}</span>
                    </span>
                    <span className="shrink-0 text-right tabular-nums">
                      <span className="block font-medium">{formatRupiah(b.balance)}</span>
                      <span className="text-foreground/60">dari {formatRupiah(b.total)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border border-line bg-surface p-5">
          <h3 className="font-heading text-2xl">Booking terdekat</h3>
          {upcoming.length === 0 ? (
            <p className="mt-3 text-sm text-foreground/70">Belum ada booking confirmed ke depan.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {upcoming.map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/booking/${b.id}`} className="flex justify-between gap-3 py-3 text-sm hover:bg-accent-soft">
                    <span className="min-w-0">
                      <span className="block font-medium">{b.clientName}</span>
                      <span className="text-foreground/60">{[b.eventType, b.makeupTime].filter(Boolean).join(" · ")}</span>
                    </span>
                    <span className="shrink-0 text-right text-foreground/80">{formatLongDate(b.eventDate)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="overflow-x-auto border border-line bg-surface">
        <table className="w-full min-w-[28rem] text-sm">
          <caption className="p-5 pb-2 text-left font-heading text-2xl">6 bulan terakhir</caption>
          <thead>
            <tr className="text-left text-[11px] tracking-[0.1em] text-foreground/60 uppercase">
              <th scope="col" className="px-5 py-2 font-normal">Bulan</th>
              <th scope="col" className="px-5 py-2 text-right font-normal">Pemasukan</th>
              <th scope="col" className="px-5 py-2 text-right font-normal">Belanja</th>
              <th scope="col" className="px-5 py-2 text-right font-normal">Laba</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line border-t border-line tabular-nums">
            {monthly.map((m) => (
              <tr key={m.month}>
                <th scope="row" className="px-5 py-3 text-left font-normal">{formatMonth(m.month)}</th>
                <td className="px-5 py-3 text-right">{formatRupiah(m.income)}</td>
                <td className="px-5 py-3 text-right">{formatRupiah(m.spending)}</td>
                <td className={`px-5 py-3 text-right font-medium ${m.profit < 0 ? "text-red-700" : ""}`}>
                  {m.profit < 0 ? `−${formatRupiah(-m.profit)}` : formatRupiah(m.profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
