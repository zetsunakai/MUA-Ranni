import "server-only";

import { gte, sql } from "drizzle-orm";
import { readWithRetry } from "@/db/read-query";
import { getDb } from "@/db";
import { expenses, payments } from "@/db/schema";
import { getBookingList } from "@/lib/bookings";
import { addMonths } from "@/lib/dates";

export type MonthFinance = { month: string; income: number; spending: number; profit: number };

// Laporan kas sederhana: pemasukan = pembayaran yang diterima (tanggal bayar),
// belanja = catatan belanja (tanggal beli). null = database belum disambungkan.
export async function getFinanceReport(today: string, months = 6) {
  const db = getDb();
  if (!db) return null;

  const thisMonth = today.slice(0, 7);
  const firstMonth = addMonths(thisMonth, -(months - 1));
  const since = `${firstMonth}-01`;

  const [incomeRows, spendingRows, bookings] = await Promise.all([
    readWithRetry(() =>
      db
        .select({ month: sql<string>`to_char(${payments.paidOn}, 'YYYY-MM')`, total: sql<number>`sum(${payments.amount})::int` })
        .from(payments)
        .where(gte(payments.paidOn, since))
        .groupBy(sql`1`),
    ),
    readWithRetry(() =>
      db
        .select({ month: sql<string>`to_char(${expenses.spentOn}, 'YYYY-MM')`, total: sql<number>`sum(${expenses.amount})::int` })
        .from(expenses)
        .where(gte(expenses.spentOn, since))
        .groupBy(sql`1`),
    ),
    getBookingList(),
  ]);

  const income = new Map(incomeRows.map((r) => [r.month, r.total]));
  const spending = new Map(spendingRows.map((r) => [r.month, r.total]));
  const monthly: MonthFinance[] = Array.from({ length: months }, (_, i) => {
    const month = addMonths(firstMonth, i);
    const inc = income.get(month) ?? 0;
    const out = spending.get(month) ?? 0;
    return { month, income: inc, spending: out, profit: inc - out };
  }).reverse(); // bulan terbaru di atas

  const active = (bookings ?? []).filter((b) => b.status === "confirmed" || b.status === "selesai");
  const unpaid = active.filter((b) => b.balance > 0).sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  const upcoming = (bookings ?? [])
    .filter((b) => b.status === "confirmed" && b.eventDate >= today)
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
    .slice(0, 5);

  return {
    current: monthly[0],
    monthly,
    receivable: unpaid.reduce((sum, b) => sum + b.balance, 0),
    unpaid,
    upcoming,
  };
}
