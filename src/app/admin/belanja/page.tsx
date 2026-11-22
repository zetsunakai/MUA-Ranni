import type { Metadata } from "next";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { requireAdmin } from "@/lib/auth";
import { addMonths, formatMonth, todayInJakarta } from "@/lib/dates";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/expense-labels";
import { getExpensesForMonth } from "@/lib/expenses";
import { formatRupiah } from "@/lib/format";

export const metadata: Metadata = { title: "Belanja" };

export default async function AdminBelanjaPage({ searchParams }: PageProps<"/admin/belanja">) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const thisMonth = todayInJakarta().slice(0, 7);
  const month = typeof params.bulan === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(params.bulan) ? params.bulan : thisMonth;
  const list = await getExpensesForMonth(month);

  const total = (list ?? []).reduce((sum, e) => sum + e.amount, 0);

  // Kelompokkan per tanggal supaya mudah dibaca seperti buku kas.
  const days = new Map<string, NonNullable<typeof list>>();
  for (const e of list ?? []) days.set(e.spentOn, [...(days.get(e.spentOn) ?? []), e]);

  return (
    <>
      <AdminHeader email={admin.email} current="/admin/belanja" />
      <div className="admin-content mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-heading text-4xl">Belanja</h1>
          <Link href="/admin/belanja/baru" className="editorial-button editorial-button-primary">+ Catat belanja</Link>
        </div>

        <nav aria-label="Pilih bulan" className="flex items-center justify-between border border-line bg-surface">
          <Link href={`/admin/belanja?bulan=${addMonths(month, -1)}`} className="flex min-h-12 items-center px-4 text-sm hover:bg-accent-soft" aria-label="Bulan sebelumnya">←</Link>
          <p className="font-heading text-xl">{formatMonth(month)}</p>
          {month < thisMonth ? (
            <Link href={`/admin/belanja?bulan=${addMonths(month, 1)}`} className="flex min-h-12 items-center px-4 text-sm hover:bg-accent-soft" aria-label="Bulan berikutnya">→</Link>
          ) : (
            <span className="min-h-12 px-4" />
          )}
        </nav>

        {!list ? (
          <p className="border border-line bg-surface p-4 text-sm">Database belum disambungkan.</p>
        ) : (
          <>
            <section className="bg-accent-soft p-5">
              <p className="editorial-label">Total belanja</p>
              <p className="mt-2 font-heading text-4xl">{formatRupiah(total)}</p>
            </section>

            {list.length === 0 ? (
              <p className="border border-line bg-surface p-4 text-sm text-foreground/70">Belum ada belanja di {formatMonth(month)}.</p>
            ) : (
              [...days].map(([date, items]) => (
                <section key={date}>
                  <h2 className="mb-2 text-[11px] tracking-[0.12em] text-foreground/60 uppercase">
                    {new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`))}
                  </h2>
                  <ul className="divide-y divide-line border border-line bg-surface">
                    {items.map((e) => (
                      <li key={e.id}>
                        <Link href={`/admin/belanja/${e.id}`} className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-accent-soft">
                          <div className="min-w-0">
                            <p className="font-medium">{e.item}</p>
                            <p className="text-sm text-foreground/70">
                              {[EXPENSE_CATEGORY_LABELS[e.category], e.store].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                          <p className="shrink-0 font-medium tabular-nums">{formatRupiah(e.amount)}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            )}
          </>
        )}
      </div>
    </>
  );
}
