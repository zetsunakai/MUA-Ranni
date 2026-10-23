import "server-only";

import { and, asc, gte, lte } from "drizzle-orm";
import { cache } from "react";
import { readWithRetry } from "@/db/read-query";
import { getDb } from "@/db";
import { scheduleDays } from "@/db/schema";
import { addDays, addMonths, todayInJakarta, type ScheduleStatus } from "@/lib/dates";

// Rentang kalender: dari awal bulan ini sampai 12 bulan ke depan.
export const SCHEDULE_MONTHS_AHEAD = 11;

function range() {
  const today = todayInJakarta();
  const from = `${today.slice(0, 7)}-01`;
  const to = addDays(`${addMonths(today.slice(0, 7), SCHEDULE_MONTHS_AHEAD + 1)}-01`, -1);
  return { from, to };
}

// Untuk halaman publik: HANYA tanggal + status. Catatan admin tidak ikut.
export const getPublicSchedule = cache(async (): Promise<Record<string, ScheduleStatus>> => {
  const db = getDb();
  if (!db) return {};
  const { from, to } = range();
  const rows = await readWithRetry(() => db
    .select({ date: scheduleDays.date, status: scheduleDays.status })
    .from(scheduleDays)
    .where(and(gte(scheduleDays.date, from), lte(scheduleDays.date, to))));
  return Object.fromEntries(rows.map((r) => [r.date, r.status]));
});

// Untuk admin: termasuk catatan pribadi.
export async function getAdminSchedule() {
  const db = getDb();
  if (!db) return null;
  const { from, to } = range();
  return db
    .select()
    .from(scheduleDays)
    .where(and(gte(scheduleDays.date, from), lte(scheduleDays.date, to)))
    .orderBy(asc(scheduleDays.date));
}
