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
  limited: "sisa sedikit",
  full: "penuh",
};

// Tampilan mengikuti lebar kalender itu sendiri (container query `@container`), bukan lebar layar:
// kotak kecil berisi angka saja kalau sempit (HP, kolom admin), kotak besar dengan
// keterangan "Penuh"/"Sisa sedikit" kalau lebar (desktop halaman Jadwal).
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
    <div className="calendar-panel @container rounded-none border border-line bg-white p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between gap-3">
        <p aria-live="polite" className="font-heading text-[30px] leading-none @md:text-[40px]">
          {formatMonth(month)}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, -1))}
            disabled={month <= minMonth}
            aria-label="Bulan sebelumnya"
            className="flex h-11 w-11 items-center justify-center border border-line transition-colors hover:bg-accent-soft disabled:opacity-30 disabled:hover:bg-transparent @md:h-12 @md:w-12"
          >
            <Arrow direction="left" />
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, 1))}
            disabled={month >= maxMonth}
            aria-label="Bulan berikutnya"
            className="flex h-11 w-11 items-center justify-center border border-line bg-foreground text-background transition-colors hover:bg-accent-strong hover:border-accent-strong disabled:opacity-30 disabled:hover:bg-foreground @md:h-12 @md:w-12"
          >
            <Arrow direction="right" />
          </button>
        </div>
      </div>

      <table className="mt-4 w-full table-fixed border-separate border-spacing-1 @md:mt-6 @md:border-spacing-2" role="grid">
        <thead>
          <tr>
            {WEEKDAY_LABELS.map((d) => (
              <th
                key={d}
                scope="col"
                className="pb-1 text-[10px] font-bold tracking-[0.08em] text-muted uppercase @md:text-xs @md:tracking-[0.12em]"
              >
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
                const note = isSelected ? "Dipilih" : past ? null : status === "full" ? "Penuh" : status === "limited" ? "Sisa sedikit" : null;
                return (
                  <td key={date} className="p-0">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onSelect(date)}
                      aria-pressed={isSelected}
                      aria-label={`${formatLongDate(date)}, ${past ? "sudah lewat" : statusLabel[status ?? "available"]}`}
                      className={`relative flex h-11 w-full flex-col items-center justify-center rounded-none text-sm tabular-nums transition-colors @md:h-[84px] @md:items-start @md:justify-between @md:px-2.5 @md:py-2 @md:text-[17px] @lg:px-3 @lg:py-2.5 ${cellClass(
                        status,
                        past,
                        isSelected,
                      )}`}
                    >
                      <span className={date === today ? "underline underline-offset-4" : undefined}>
                        {Number(date.slice(8))}
                      </span>
                      {note && (
                        <span aria-hidden="true" className="hidden text-left text-[11px] leading-tight @md:block">
                          {note}
                        </span>
                      )}
                      {marked?.has(date) && (
                        <span aria-hidden="true" className="absolute right-1.5 bottom-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted @md:mt-4 @md:gap-x-7 @md:text-sm">
        <Legend className="border border-line bg-background">Tersedia</Legend>
        <Legend className="bg-limited">Sisa sedikit</Legend>
        <Legend className="bg-foreground">Penuh</Legend>
      </ul>
    </div>
  );
}

function cellClass(status: ScheduleStatus | undefined, past: boolean, selected: boolean): string {
  if (selected) return "border-2 border-accent-strong bg-white font-bold text-accent-strong";
  if (past) return "text-foreground/30";
  if (status === "full") return "bg-foreground text-[#a8998d] enabled:hover:bg-foreground/85";
  if (status === "limited") return "bg-limited hover:ring-1 hover:ring-accent-strong";
  return "border border-line bg-background hover:border-accent-strong";
}

function Legend({ className, children }: { className: string; children: string }) {
  return (
    <li className="flex items-center gap-1.5 @md:gap-2">
      <span aria-hidden="true" className={`inline-block h-3 w-3 rounded-[3px] @md:h-3.5 @md:w-3.5 ${className}`} />
      {children}
    </li>
  );
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === "left" ? "M19 12H5M11 6l-6 6 6 6" : "M5 12h14M13 6l6 6-6 6"} />
    </svg>
  );
}
