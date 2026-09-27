import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { site } from "@/data/site";
import { requireAdmin } from "@/lib/auth";
import { addDays, formatLongDate, todayInJakarta } from "@/lib/dates";
import { getPortfolioItems } from "@/lib/portfolio";
import { getServiceGroups } from "@/lib/prices";
import { getAdminSchedule } from "@/lib/schedule";
import { getTestimonialAdminData } from "@/lib/testimonials";

export const metadata: Metadata = { title: "Ringkasan" };

export default async function AdminDashboard() {
  const admin = await requireAdmin();
  const today = todayInJakarta();
  const weekEnd = addDays(today, 6);
  const [schedule, testimonials, portfolio, groups] = await Promise.all([
    getAdminSchedule(),
    getTestimonialAdminData(),
    getPortfolioItems(),
    getServiceGroups(),
  ]);

  const thisWeek = (schedule ?? []).filter((d) => d.date >= today && d.date <= weekEnd);
  const pending = testimonials?.pending ?? [];
  const openInvites = testimonials?.openInvites ?? [];
  const stats = [
    { label: "foto portofolio", value: portfolio.length, href: "/admin/portofolio" },
    { label: "layanan", value: groups.reduce((n, g) => n + g.items.length, 0), href: "/admin/layanan" },
    { label: "testimoni tampil", value: testimonials?.approved.length ?? 0, href: "/admin/testimoni" },
  ];

  return (
    <>
      <AdminHeader email={admin.email} current="/admin" />
      <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6">
        <div>
          <h1 className="font-heading text-4xl">Halo! 👋</h1>
          <p className="mt-1 text-sm text-foreground/70">Ringkasan {site.name} hari ini, {formatLongDate(today)}.</p>
        </div>

        <Card title="7 hari ke depan" href="/admin/jadwal" linkLabel="Buka kalender">
          {thisWeek.length === 0 ? (
            <p className="text-sm text-foreground/70">Belum ada tanggal yang ditandai minggu ini.</p>
          ) : (
            <ul className="divide-y divide-line">
              {thisWeek.map((d) => (
                <li key={d.date} className="flex items-start gap-3 py-2.5">
                  <span
                    className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      d.status === "full" ? "bg-foreground/10" : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {d.status === "full" ? "Penuh" : "Terbatas"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{d.date === today ? "Hari ini" : formatLongDate(d.date)}</p>
                    {d.note && <p className="text-sm text-foreground/75">{d.note}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="grid gap-5 sm:grid-cols-2">
          <Card title="Testimoni menunggu" href="/admin/testimoni" linkLabel={pending.length ? "Periksa" : "Buka"}>
            <p className="font-heading text-5xl">{pending.length}</p>
            <p className="mt-1 text-sm text-foreground/70">
              {pending.length ? `Dari ${pending.map((t) => t.clientName).slice(0, 3).join(", ")}` : "Semua sudah diperiksa."}
            </p>
          </Card>
          <Card title="Link testimoni belum diisi" href="/admin/testimoni" linkLabel="Lihat">
            <p className="font-heading text-5xl">{openInvites.length}</p>
            <p className="mt-1 text-sm text-foreground/70">
              {openInvites.length ? `Untuk ${openInvites.map((i) => i.clientName).slice(0, 3).join(", ")}` : "Tidak ada yang menunggu."}
            </p>
          </Card>
        </div>

        <ul className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <li key={s.label}>
              <Link href={s.href} className="block rounded-xl border border-line bg-surface px-3 py-4 text-center hover:border-accent">
                <span className="block font-heading text-3xl">{s.value}</span>
                <span className="block text-xs text-foreground/70">{s.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">Pintasan</h2>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <QuickLink href="/admin/jadwal">Tandai jadwal</QuickLink>
            <QuickLink href="/admin/portofolio/baru">Tambah foto</QuickLink>
            <QuickLink href="/admin/testimoni">Minta testimoni</QuickLink>
            <QuickLink href="/admin/layanan">Ubah harga</QuickLink>
          </div>
        </section>
      </div>
    </>
  );
}

function Card({ title, href, linkLabel, children }: { title: string; href: string; linkLabel: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-heading text-2xl">{title}</h2>
        <Link href={href} className="shrink-0 text-sm font-medium text-accent-strong">
          {linkLabel} →
        </Link>
      </div>
      {children}
    </section>
  );
}

function QuickLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="flex h-12 items-center justify-center rounded-xl border border-line bg-surface text-sm font-medium hover:border-accent">
      {children}
    </Link>
  );
}
