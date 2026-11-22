import type { Metadata } from "next";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { BOOKING_STATUSES } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { PAYMENT_STATUS_LABELS, STATUS_LABELS, type BookingStatus } from "@/lib/booking-math";
import { getBookingList } from "@/lib/bookings";
import { formatLongDate, todayInJakarta } from "@/lib/dates";
import { formatRupiah } from "@/lib/format";

export const metadata: Metadata = { title: "Booking" };

const PAYMENT_BADGE = {
  belum: "bg-red-50 text-red-800",
  dp: "bg-amber-100 text-amber-900",
  lunas: "bg-emerald-50 text-emerald-800",
  lebih: "bg-sky-50 text-sky-800",
} as const;

export default async function AdminBookingPage({ searchParams }: PageProps<"/admin/booking">) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const status = BOOKING_STATUSES.find((s) => s === params.status) as BookingStatus | undefined;
  const list = await getBookingList(status);
  const today = todayInJakarta();
  const tabs = [{ value: undefined, label: "Semua" }, ...BOOKING_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))];

  return (
    <>
      <AdminHeader email={admin.email} current="/admin/booking" />
      <div className="admin-content mx-auto w-full max-w-6xl space-y-6 px-4 py-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-4xl">Booking</h1>
          </div>
          <Link href="/admin/booking/baru" className="editorial-button editorial-button-primary">+ Booking baru</Link>
        </div>

        <nav aria-label="Filter status" className="scrollbar-none flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.value ? `/admin/booking?status=${tab.value}` : "/admin/booking"}
              aria-current={tab.value === status ? "page" : undefined}
              className={`shrink-0 px-4 py-2.5 text-[11px] tracking-[0.1em] uppercase ${tab.value === status ? "bg-foreground text-background" : "border border-line hover:bg-accent-soft"}`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {!list ? (
          <p className="border border-line bg-surface p-4 text-sm">Database belum disambungkan.</p>
        ) : list.length === 0 ? (
          <p className="border border-line bg-surface p-4 text-sm text-foreground/70">Belum ada booking{status ? ` dengan status ${STATUS_LABELS[status].toLowerCase()}` : ""}.</p>
        ) : (
          <ul className="divide-y divide-line border border-line bg-surface">
            {list.map((b) => (
              <li key={b.id}>
                <Link href={`/admin/booking/${b.id}`} className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 hover:bg-accent-soft">
                  <div className="min-w-0">
                    <p className="text-[11px] tracking-[0.1em] text-foreground/60 uppercase">
                      {b.code} · {STATUS_LABELS[b.status]}
                    </p>
                    <p className="font-heading text-xl">{b.clientName}</p>
                    <p className="text-sm text-foreground/75">
                      {formatLongDate(b.eventDate)}{b.eventDate < today && b.status === "confirmed" ? " · sudah lewat" : ""}
                      {b.eventType ? ` · ${b.eventType}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading text-xl">{formatRupiah(b.total)}</p>
                    {b.status !== "estimasi" && b.status !== "batal" && (
                      <span className={`mt-1 inline-block px-2 py-0.5 text-[11px] font-semibold ${PAYMENT_BADGE[b.paymentStatus]}`}>
                        {PAYMENT_STATUS_LABELS[b.paymentStatus]}
                        {b.paymentStatus === "dp" ? ` · sisa ${formatRupiah(b.balance)}` : ""}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
