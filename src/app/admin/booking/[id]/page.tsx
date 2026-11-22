import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteBooking, deletePayment, issueInvoice, setBookingStatus } from "@/app/admin/booking/actions";
import AdminHeader from "@/components/admin/AdminHeader";
import BookingEditor from "@/components/admin/BookingEditor";
import ConfirmButton from "@/components/admin/ConfirmButton";
import InvoiceActions from "@/components/admin/InvoiceActions";
import PaymentForm from "@/components/admin/PaymentForm";
import { requireAdmin } from "@/lib/auth";
import { getBookingFormOptions } from "@/lib/booking-catalog";
import { PAYMENT_KIND_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, STATUS_LABELS, type BookingStatus } from "@/lib/booking-math";
import { getBooking } from "@/lib/bookings";
import { formatLongDate, todayInJakarta } from "@/lib/dates";
import { formatRupiah } from "@/lib/format";

export const metadata: Metadata = { title: "Detail booking" };

// Tombol perpindahan status yang masuk akal dari tiap status.
const NEXT_STATUS: Record<BookingStatus, { status: BookingStatus; label: string; confirm?: string }[]> = {
  estimasi: [
    { status: "confirmed", label: "Confirm booking" },
    { status: "batal", label: "Batalkan", confirm: "Tandai estimasi ini batal?" },
  ],
  confirmed: [
    { status: "selesai", label: "Tandai selesai" },
    { status: "estimasi", label: "Kembalikan ke estimasi" },
    { status: "batal", label: "Batalkan", confirm: "Batalkan booking ini? Pembayaran yang sudah tercatat tetap tersimpan." },
  ],
  selesai: [],
  batal: [{ status: "estimasi", label: "Aktifkan lagi (estimasi)" }],
};

export default async function BookingDetailPage({ params }: PageProps<"/admin/booking/[id]">) {
  const admin = await requireAdmin();
  const { id } = await params;
  const [data, options] = await Promise.all([getBooking(id), getBookingFormOptions()]);
  if (!data) notFound();
  const { booking: b, lines, payments, totals } = data;
  // Versi di URL supaya browser tidak memakai gambar lama setelah data berubah.
  const invoiceSrc = `/admin/booking/${b.id}/invoice?v=${b.updatedAt.getTime()}-${payments.length}-${totals.paid}`;

  return (
    <>
      <AdminHeader email={admin.email} current="/admin/booking" />
      <div className="admin-content mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
        <div>
          <Link href="/admin/booking" className="text-sm text-accent-strong">← Semua booking</Link>
          <p className="mt-3 text-[11px] tracking-[0.12em] text-foreground/60 uppercase">{b.code} · {STATUS_LABELS[b.status]}</p>
          <h1 className="font-heading text-4xl">{b.clientName}</h1>
          <p className="mt-1 text-sm text-foreground/70">{formatLongDate(b.eventDate)}{b.makeupTime ? `, ${b.makeupTime}` : ""}</p>
        </div>

        {NEXT_STATUS[b.status].length > 0 && <section className="flex flex-wrap gap-2">
          {NEXT_STATUS[b.status].map((next) => (
            <form key={next.status} action={setBookingStatus}>
              <input type="hidden" name="id" value={b.id} />
              <input type="hidden" name="status" value={next.status} />
              <ConfirmButton
                confirmMessage={next.confirm}
                pendingLabel="Memproses…"
                className={`min-h-11 px-5 text-sm ${next.status === "confirmed" || next.status === "selesai" ? "bg-foreground text-white" : "border border-line hover:bg-accent-soft"}`}
              >
                {next.label}
              </ConfirmButton>
            </form>
          ))}
        </section>}

        <section className="space-y-4 border border-line bg-surface p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-heading text-2xl">Pembayaran</h2>
            <p className="text-sm font-semibold">{PAYMENT_STATUS_LABELS[data.paymentStatus]}</p>
          </div>
          <dl className="grid grid-cols-3 gap-3 text-sm">
            <div><dt className="text-foreground/60">Total</dt><dd className="font-heading text-xl">{formatRupiah(totals.total)}</dd></div>
            <div><dt className="text-foreground/60">Dibayar</dt><dd className="font-heading text-xl">{formatRupiah(totals.paid)}</dd></div>
            <div><dt className="text-foreground/60">{totals.balance < 0 ? "Lebih bayar" : "Sisa"}</dt><dd className="font-heading text-xl">{formatRupiah(Math.abs(totals.balance))}</dd></div>
          </dl>

          {payments.length > 0 && (
            <ul className="divide-y divide-line border border-line">
              {payments.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium">{formatRupiah(p.amount)} · {PAYMENT_KIND_LABELS[p.kind]}</p>
                    <p className="text-foreground/70">{formatLongDate(p.paidOn)} · {PAYMENT_METHOD_LABELS[p.method]}{p.note ? ` · ${p.note}` : ""}</p>
                  </div>
                  <form action={deletePayment}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="bookingId" value={b.id} />
                    <ConfirmButton confirmMessage={`Hapus pembayaran ${formatRupiah(p.amount)}?`} className="min-h-11 text-xs text-red-700">Hapus</ConfirmButton>
                  </form>
                </li>
              ))}
            </ul>
          )}

          {b.status === "batal" ? (
            <p className="text-sm text-foreground/70">Booking batal. Aktifkan lagi untuk mencatat pembayaran.</p>
          ) : (
            <PaymentForm bookingId={b.id} today={todayInJakarta()} balance={totals.balance} hasPayments={payments.length > 0} />
          )}
        </section>

        {(b.status === "confirmed" || b.status === "selesai") && (
          <section className="space-y-4 border border-line bg-surface p-4 sm:p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-heading text-2xl">Invoice</h2>
              {b.invoiceNumber && <p className="text-sm text-foreground/70">{b.invoiceNumber}</p>}
            </div>
            {b.invoiceNumber ? (
              <>
                <InvoiceActions src={invoiceSrc} fileName={`${b.invoiceNumber}.png`} />
                <p className="text-xs text-foreground/60">Gambar selalu mengikuti data terbaru (layanan, pembayaran, sisa tagihan).</p>
                {/* eslint-disable-next-line @next/next/no-img-element -- PNG dinamis dari route admin, bukan aset statis */}
                <img src={invoiceSrc} alt={`Invoice ${b.invoiceNumber}`} className="w-full border border-line" />
              </>
            ) : (
              <form action={issueInvoice} className="flex flex-wrap items-center gap-3">
                <input type="hidden" name="id" value={b.id} />
                <ConfirmButton pendingLabel="Membuat…" className="min-h-11 bg-foreground px-5 text-sm text-white">Buat invoice</ConfirmButton>
                <p className="text-sm text-foreground/70">Nomor invoice dibuat sekali dan tidak berubah.</p>
              </form>
            )}
          </section>
        )}

        <BookingEditor
          key={b.id}
          catalog={options.catalog}
          eventTypes={options.eventTypes}
          draft={{
            id: b.id,
            clientName: b.clientName,
            clientPhone: b.clientPhone ?? "",
            eventType: b.eventType ?? "",
            eventDate: b.eventDate,
            makeupTime: b.makeupTime ?? "",
            location: b.location ?? "",
            mapsUrl: b.mapsUrl ?? "",
            people: b.people ? String(b.people) : "",
            hairdo: b.hairdo ?? "",
            note: b.note ?? "",
            transportFee: b.transportFee,
            discount: b.discount,
            lines: lines.map((l) => ({ key: l.id, serviceItemId: l.serviceItemId, description: l.description, qty: l.qty, unitPrice: l.unitPrice })),
          }}
        />

        <form action={deleteBooking} className="border-t border-line pt-6 pb-28">
          <input type="hidden" name="id" value={b.id} />
          <ConfirmButton
            confirmMessage={`Hapus permanen booking ${b.code} beserta semua pembayarannya? Tidak bisa dibatalkan.`}
            pendingLabel="Menghapus…"
            className="min-h-11 text-sm text-red-700"
          >
            Hapus booking
          </ConfirmButton>
        </form>
      </div>
    </>
  );
}
