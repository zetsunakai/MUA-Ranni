"use client";

import Link from "next/link";
import { useState } from "react";
import MonthCalendar from "@/components/MonthCalendar";
import { addMonths, formatLongDate, type ScheduleStatus } from "@/lib/dates";

type Day = { date: string; status: ScheduleStatus; note: string | null };
export default function DashboardCalendar({ days, today, monthsAhead }: { days: Day[]; today: string; monthsAhead: number }) {
  const [month, setMonth] = useState(today.slice(0, 7));
  const [selected, setSelected] = useState<string | null>(null);
  const day = days.find(d => d.date === selected);
  return <section className="dashboard-calendar">
    <div className="admin-panel-heading"><p className="editorial-label">Jadwal</p><Link href="/admin/jadwal">Buka kalender →</Link></div>
    <MonthCalendar month={month} minMonth={today.slice(0, 7)} maxMonth={addMonths(today.slice(0, 7), monthsAhead)} onMonthChange={setMonth} today={today} statuses={Object.fromEntries(days.map(d => [d.date, d.status]))} selected={selected} marked={new Set(days.filter(d => d.note).map(d => d.date))} onSelect={setSelected} selectableFull />
    {selected && <div className="selected-day"><p className="font-heading text-2xl">{formatLongDate(selected)}</p><p className="mt-2 text-sm text-muted">{day?.note || (day?.status === "full" ? "Penuh" : day?.status === "limited" ? "Terbatas" : "Tersedia")}</p><Link href="/admin/jadwal" className="editorial-text-link">Tandai jadwal →</Link></div>}
  </section>;
}
