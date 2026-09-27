"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/app/admin/actions";
import { setScheduleDay } from "@/app/admin/jadwal/actions";
import MonthCalendar from "@/components/MonthCalendar";
import { addMonths, formatLongDate, type ScheduleStatus } from "@/lib/dates";

type Day = { date: string; status: ScheduleStatus; note: string | null };
type Props = { days: Day[]; today: string; monthsAhead: number };

const initialState: FormState = { status: "idle", message: "" };

const options = [
  { value: "available", label: "Tersedia", hint: "Masih kosong" },
  { value: "limited", label: "Terbatas", hint: "Sebagian slot terisi" },
  { value: "full", label: "Penuh", hint: "Tidak bisa terima lagi" },
] as const;

export default function ScheduleEditor({ days, today, monthsAhead }: Props) {
  const [state, formAction, saving] = useActionState(setScheduleDay, initialState);
  const minMonth = today.slice(0, 7);
  const [month, setMonth] = useState(minMonth);
  const [selected, setSelected] = useState<string | null>(null);

  const byDate = new Map(days.map((d) => [d.date, d]));
  const statuses = Object.fromEntries(days.map((d) => [d.date, d.status]));
  const marked = new Set(days.filter((d) => d.note).map((d) => d.date));
  const current = selected ? byDate.get(selected) : undefined;

  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,26rem)_1fr] md:items-start">
      <MonthCalendar
        month={month}
        minMonth={minMonth}
        maxMonth={addMonths(minMonth, monthsAhead)}
        onMonthChange={setMonth}
        today={today}
        statuses={statuses}
        selected={selected}
        onSelect={setSelected}
        marked={marked}
        selectableFull
      />

      <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
        {selected ? (
          // key: form di-reset ke nilai tanggal yang baru dipilih.
          <form key={`${selected}-${current?.status}-${current?.note}`} action={formAction} className="space-y-4">
            <input type="hidden" name="date" value={selected} />
            <p className="font-heading text-2xl">{formatLongDate(selected)}</p>

            <fieldset>
              <legend className="text-sm font-medium">Status</legend>
              <div className="mt-2 grid gap-2">
                {options.map((o) => (
                  <label
                    key={o.value}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-line px-3 py-2.5 has-[:checked]:border-accent-strong has-[:checked]:bg-accent-soft/60"
                  >
                    <input
                      type="radio"
                      name="status"
                      value={o.value}
                      defaultChecked={(current?.status ?? "available") === o.value}
                      className="h-4 w-4 accent-accent-strong"
                    />
                    <span>
                      <span className="block text-sm font-medium">{o.label}</span>
                      <span className="block text-xs text-foreground/70">{o.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="note" className="text-sm font-medium">
                Catatan <span className="font-normal text-foreground/70">(hanya terlihat di admin)</span>
              </label>
              <textarea
                id="note"
                name="note"
                rows={3}
                maxLength={200}
                defaultValue={current?.note ?? ""}
                placeholder="contoh: Akad Nadia, 06.00, Depok"
                className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-base outline-none focus:border-accent-strong"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-accent-strong py-3 font-medium text-white hover:bg-foreground disabled:opacity-60"
            >
              {saving ? "Menyimpan…" : "Simpan"}
            </button>
            <p aria-live="polite" className={`text-sm ${state.status === "error" ? "text-red-700" : "text-foreground/80"}`}>
              {state.message}
            </p>
          </form>
        ) : (
          <>
            <p className="font-heading text-2xl">Pilih tanggal</p>
            <p className="mt-2 text-sm text-foreground/80">
              Ketuk tanggal untuk menandai Terbatas atau Penuh, dan tambahkan catatan (nama klien, jam, lokasi).
              Tanggal bertitik punya catatan.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
