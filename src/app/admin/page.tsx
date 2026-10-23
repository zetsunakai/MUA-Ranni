import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import DashboardCalendar from "@/components/admin/DashboardCalendar";
import { site } from "@/data/site";
import { requireAdmin } from "@/lib/auth";
import { addDays, formatLongDate, todayInJakarta } from "@/lib/dates";
import { getPortfolioItems } from "@/lib/portfolio";
import { getServiceGroups } from "@/lib/prices";
import { getAdminSchedule, SCHEDULE_MONTHS_AHEAD } from "@/lib/schedule";
import { getTestimonialAdminData } from "@/lib/testimonials";

export const metadata: Metadata = { title: "Ringkasan" };
export default async function AdminDashboard() {
  const admin = await requireAdmin();
  const today = todayInJakarta();
  const [schedule, testimonials, portfolio, groups] = await Promise.all([getAdminSchedule(), getTestimonialAdminData(), getPortfolioItems(), getServiceGroups()]);
  const thisWeek = (schedule ?? []).filter(d => d.date >= today && d.date <= addDays(today, 6));
  const pending = testimonials?.pending ?? [];
  const openInvites = testimonials?.openInvites ?? [];
  const photo = portfolio.find(p => p.featured) ?? portfolio[0];
  const stats = [
    { label: "foto portofolio", value: portfolio.length, href: "/admin/portofolio" },
    { label: "layanan", value: groups.reduce((n, g) => n + g.items.length, 0), href: "/admin/layanan" },
    { label: "testimoni tampil", value: testimonials?.approved.length ?? 0, href: "/admin/testimoni" },
    { label: "Testimoni menunggu", value: pending.length, href: "/admin/testimoni" },
  ];
  return <><AdminHeader email={admin.email} current="/admin" /><div className="admin-content mx-auto w-full max-w-6xl">
    <div className="admin-page-intro"><div><p className="editorial-label">Ringkasan</p><h1 className="font-heading">Halo! 👋</h1><p className="editorial-description">Ringkasan {site.name} hari ini, {formatLongDate(today)}.</p></div><Link href="/admin/jadwal" className="editorial-button editorial-button-primary">Tandai jadwal</Link></div>
    <ul className="admin-metrics">{stats.map(stat => <li key={stat.label}><Link href={stat.href}><span className="editorial-label">{stat.label}</span><strong className="font-heading">{stat.value.toString().padStart(2, "0")}</strong></Link></li>)}</ul>
    <div className="dashboard-spread"><div>
      {schedule ? <DashboardCalendar days={schedule} today={today} monthsAhead={SCHEDULE_MONTHS_AHEAD} /> : <div className="sidebar-panel">Database belum disambungkan.</div>}
      <section className="admin-agenda"><div className="admin-panel-heading"><div><p className="editorial-label">Jadwal</p><h2 className="font-heading">7 hari ke depan</h2></div><Link href="/admin/jadwal">Buka kalender →</Link></div>
        {thisWeek.length === 0 ? <p className="editorial-description">Belum ada tanggal yang ditandai minggu ini.</p> : <ul>{thisWeek.map(d => <li key={d.date}><div className="agenda-date"><span>{d.date.slice(5, 7)}</span><strong className="font-heading">{Number(d.date.slice(8))}</strong></div><div><p className="font-heading text-xl">{d.date === today ? "Hari ini" : formatLongDate(d.date)}</p>{d.note && <p className="editorial-description">{d.note}</p>}</div><span className={`agenda-status ${d.status === "full" ? "bg-foreground text-background" : "bg-limited"}`}>{d.status === "full" ? "Penuh" : "Terbatas"}</span></li>)}</ul>}
      </section>
    </div><aside className="dashboard-side">
      <section className="sidebar-panel"><p className="editorial-label">Testimoni</p><h2 className="font-heading">Testimoni menunggu</h2>{pending.length ? <ul className="pending-queue">{pending.slice(0, 3).map(t => <li key={t.id}><p className="font-heading text-xl">{t.clientName}</p><blockquote className="editorial-description mt-3">“{t.quote}”</blockquote><Link href="/admin/testimoni" className="editorial-text-link">Periksa →</Link></li>)}</ul> : <p className="editorial-description">Semua sudah diperiksa.</p>}<Link href="/admin/testimoni" className="editorial-text-link">Buka →</Link></section>
      {photo && <section className="sidebar-panel"><p className="editorial-label">Portofolio · Home</p><div className="relative mt-5 aspect-[4/5]"><Image src={photo.imageUrl} alt={photo.title} fill sizes="(min-width: 1024px) 280px, 80vw" className="object-cover" /></div><h2 className="font-heading">{photo.title}</h2><Link href={`/admin/portofolio/${photo.id}`} className="editorial-text-link">Edit →</Link></section>}
      <section className="sidebar-panel"><p className="editorial-label">Link testimoni belum diisi</p><p className="mt-4 font-heading text-5xl">{openInvites.length}</p><p className="editorial-description mt-3">{openInvites.length ? `Untuk ${openInvites.map(i => i.clientName).slice(0, 3).join(", ")}` : "Tidak ada yang menunggu."}</p><Link href="/admin/testimoni" className="editorial-text-link">Lihat →</Link></section>
    </aside></div>
    <section className="admin-shortcuts"><h2 className="editorial-label">Pintasan</h2><div><Link href="/admin/jadwal">Tandai jadwal →</Link><Link href="/admin/portofolio/baru">Tambah foto →</Link><Link href="/admin/testimoni">Minta testimoni →</Link><Link href="/admin/layanan">Ubah harga →</Link></div></section>
  </div></>;
}
