import type { Metadata } from "next";
import AdminHeader from "@/components/admin/AdminHeader";
import ScheduleEditor from "@/components/admin/ScheduleEditor";
import { requireAdmin } from "@/lib/auth";
import { formatLongDate, todayInJakarta } from "@/lib/dates";
import { getAdminSchedule, SCHEDULE_MONTHS_AHEAD } from "@/lib/schedule";

export const metadata: Metadata = { title: "Jadwal" };

export default async function AdminJadwalPage() {
  const admin = await requireAdmin();
  const days = await getAdminSchedule();
  const today = todayInJakarta();
  const upcoming = (days ?? []).filter((d) => d.date >= today);

  return (
    <>
      <AdminHeader email={admin.email} current="/admin/jadwal" />
      <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-6">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Jadwal</h1>
          <p className="mt-1 text-sm text-foreground/70">
            Pengunjung hanya melihat status tanggal (tersedia / terbatas / penuh), tidak melihat catatan.
          </p>
        </div>

        {!days ? (
          <p className="rounded-lg border border-line bg-surface p-4 text-sm">Database belum disambungkan.</p>
        ) : (
          <>
            <ScheduleEditor
              days={days.map((d) => ({ date: d.date, status: d.status, note: d.note }))}
              today={today}
              monthsAhead={SCHEDULE_MONTHS_AHEAD}
            />

            <section>
              <h2 className="font-heading text-xl font-semibold">
                Tanggal terisi ke depan <span className="text-foreground/70">({upcoming.length})</span>
              </h2>
              {upcoming.length === 0 ? (
                <p className="mt-2 text-sm text-foreground/70">Belum ada tanggal yang ditandai.</p>
              ) : (
                <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
                  {upcoming.map((d) => (
                    <li key={d.date} className="flex items-start gap-3 px-4 py-3">
                      <span
                        className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          d.status === "full" ? "bg-foreground/10" : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {d.status === "full" ? "Penuh" : "Terbatas"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{formatLongDate(d.date)}</p>
                        {d.note && <p className="text-sm text-foreground/75">{d.note}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
