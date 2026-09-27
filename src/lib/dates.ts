// Utilitas tanggal untuk kalender. Tanggal selalu berupa string "YYYY-MM-DD".
// Semua perhitungan memakai UTC supaya tanggal tidak pernah bergeser karena zona waktu
// perangkat pengunjung; "hari ini" dihitung menurut WIB (Asia/Jakarta).

export type ScheduleStatus = "limited" | "full";

export function todayInJakarta(): string {
  // Locale en-CA menghasilkan format YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
}

function toUtcDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = toUtcDate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toIso(d);
}

// "2026-10" + 1 -> "2026-11"
export function addMonths(month: string, count: number): string {
  const [y, m] = month.split("-").map(Number);
  return toIso(new Date(Date.UTC(y, m - 1 + count, 1))).slice(0, 7);
}

// "Sabtu, 17 Oktober 2026"
export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(toUtcDate(iso));
}

// "Oktober 2026"
export function formatMonth(month: string): string {
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    toUtcDate(`${month}-01`),
  );
}

// Minggu-minggu dalam satu bulan, dimulai Senin. null = sel kosong di luar bulan.
export function monthGrid(month: string): (string | null)[][] {
  const first = toUtcDate(`${month}-01`);
  const leading = (first.getUTCDay() + 6) % 7; // Senin = 0
  const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const cells: (string | null)[] = Array(leading).fill(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(`${month}-${String(day).padStart(2, "0")}`);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export const WEEKDAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
