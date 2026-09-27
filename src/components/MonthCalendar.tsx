"use client";

import { addMonths, formatLongDate, formatMonth, monthGrid, WEEKDAY_LABELS, type ScheduleStatus } from "@/lib/dates";

type Props = {
  month: string; // "YYYY-MM" yang sedang ditampilkan
  minMonth: string;
  maxMonth: string;
  onMonthChange: (month: string) => void;
  today: string;
  statuses: Record<string, ScheduleStatus>;
  selected?: string | null;
  onSelect: (date: string) => void;
  // Tanggal yang punya catatan admin (titik kecil). Hanya dipakai di admin.
  marked?: Set<string>;
  // Publik: tanggal penuh tidak bisa dipilih. Admin: semua tanggal bisa.
  selectableFull?: boolean;
};

const statusLabel: Record<ScheduleStatus | "available", string> = {
  available: "tersedia",
  limited: "terbatas",
  full: "penuh",
};

export default function MonthCalendar({
  month,
  minMonth,
  maxMonth,
  onMonthChange,
  today,
  statuses,
  selected,
  onSelect,
  marked,
  selectableFull = false,
}: Props) {
  const weeks = monthGrid(month);

  return (
    <div className="rounded-xl border border-line bg-surface p-3 sm:p-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, -1))}
          disabled={month <= minMonth}
          aria-label="Bulan sebelumnya"
          className="rounded-full p-2 disabled:opacity-30"
        >
          <Chevron direction="left" />
        </button>
        <p aria-live="polite" className="font-heading text-2xl">
          {formatMonth(month)}
        </p>
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, 1))}
          disabled={month >= maxMonth}
          aria-label="Bulan berikutnya"
          className="rounded-full p-2 disabled:opacity-30"
        >
          <Chevron direction="right" />
        </button>
      </div>

      <table className="mt-3 w-full table-fixed border-separate border-spacing-1" role="grid">
        <thead>
          <tr>
            {WEEKDAY_LABELS.map((d) => (
              <th key={d} scope="col" className="pb-1 text-xs font-medium text-foreground/70">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) => (
            <tr key={i}>
              {week.map((date, j) => {
                if (!date) return <td key={j} />;
                const status = statuses[date];
                const past = date < today;
                const disabled = past || (status === "full" && !selectableFull);
                const isSelected = date === selected;
                return (
                  <td key={date} className="p-0">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onSelect(date)}
                      aria-pressed={isSelected}
                      aria-label={`${formatLongDate(date)}, ${past ? "sudah lewat" : statusLabel[status ?? "available"]}`}
                      className={`relative flex aspect-square w-full flex-col items-center justify-center rounded-lg text-sm tabular-nums transition-colors ${cellClass(
                        status,
                        past,
                        isSelected,
                      )} ${date === today ? "font-bold underline underline-offset-4" : ""}`}
                    >
                      {Number(date.slice(8))}
                      {marked?.has(date) && (
                        <span aria-hidden="true" className="absolute bottom-1 h-1 w-1 rounded-full bg-current" />
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/80">
        <Legend className="border border-line bg-surface">Tersedia</Legend>
        <Legend className="bg-amber-100 ring-1 ring-amber-300">Terbatas</Legend>
        <Legend className="bg-foreground/10 line-through">Penuh</Legend>
      </ul>
    </div>
  );
}

function cellClass(status: ScheduleStatus | undefined, past: boolean, selected: boolean): string {
  if (selected) return "bg-accent-strong text-white";
  if (past) return "text-foreground/30";
  if (status === "full") return "bg-foreground/10 text-foreground/75 line-through";
  if (status === "limited") return "bg-amber-100 text-amber-900 ring-1 ring-amber-300 hover:bg-amber-200";
  return "border border-line hover:border-accent-strong hover:bg-accent-soft/50";
}

function Legend({ className, children }: { className: string; children: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span aria-hidden="true" className={`inline-block h-3.5 w-3.5 rounded ${className}`} />
      {children}
    </li>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}
