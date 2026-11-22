import "server-only";

import { asc, desc, eq, inArray, sql } from "drizzle-orm";
import { readWithRetry } from "@/db/read-query";
import { getDb } from "@/db";
import { bookingLines, bookings, payments } from "@/db/schema";
import { bookingTotals, paymentStatus, type BookingStatus } from "@/lib/booking-math";

export type BookingRow = typeof bookings.$inferSelect;
export type BookingLineRow = typeof bookingLines.$inferSelect;
export type PaymentRow = typeof payments.$inferSelect;

export type BookingSummary = BookingRow & {
  total: number;
  paid: number;
  balance: number;
  paymentStatus: ReturnType<typeof paymentStatus>;
};

// Daftar booking untuk /admin/booking. null = database belum disambungkan.
export async function getBookingList(status?: BookingStatus): Promise<BookingSummary[] | null> {
  const db = getDb();
  if (!db) return null;

  const rows = await readWithRetry(() =>
    db
      .select()
      .from(bookings)
      .where(status ? eq(bookings.status, status) : undefined)
      .orderBy(desc(bookings.eventDate), desc(bookings.createdAt)),
  );
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const [lineSums, paidSums] = await Promise.all([
    readWithRetry(() =>
      db
        .select({ bookingId: bookingLines.bookingId, subtotal: sql<number>`coalesce(sum(${bookingLines.qty} * ${bookingLines.unitPrice}), 0)::int` })
        .from(bookingLines)
        .where(inArray(bookingLines.bookingId, ids))
        .groupBy(bookingLines.bookingId),
    ),
    readWithRetry(() =>
      db
        .select({ bookingId: payments.bookingId, paid: sql<number>`coalesce(sum(${payments.amount}), 0)::int` })
        .from(payments)
        .where(inArray(payments.bookingId, ids))
        .groupBy(payments.bookingId),
    ),
  ]);
  const subtotalOf = new Map(lineSums.map((l) => [l.bookingId, l.subtotal]));
  const paidOf = new Map(paidSums.map((p) => [p.bookingId, p.paid]));

  return rows.map((row) => {
    const totals = bookingTotals([{ qty: 1, unitPrice: subtotalOf.get(row.id) ?? 0 }], row.transportFee, row.discount, paidOf.get(row.id) ?? 0);
    return { ...row, total: totals.total, paid: totals.paid, balance: totals.balance, paymentStatus: paymentStatus(totals.total, totals.paid) };
  });
}

export async function getBooking(id: string) {
  const db = getDb();
  if (!db) return null;
  const [booking] = await readWithRetry(() => db.select().from(bookings).where(eq(bookings.id, id)));
  if (!booking) return null;
  const [lines, paymentRows] = await Promise.all([
    readWithRetry(() => db.select().from(bookingLines).where(eq(bookingLines.bookingId, id)).orderBy(asc(bookingLines.sortOrder))),
    readWithRetry(() => db.select().from(payments).where(eq(payments.bookingId, id)).orderBy(asc(payments.paidOn), asc(payments.createdAt))),
  ]);
  const paid = paymentRows.reduce((sum, p) => sum + p.amount, 0);
  const totals = bookingTotals(lines, booking.transportFee, booking.discount, paid);
  return { booking, lines, payments: paymentRows, totals, paymentStatus: paymentStatus(totals.total, paid) };
}
