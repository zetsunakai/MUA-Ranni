import type { Metadata } from "next";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminPortfolioGallery from "@/components/admin/AdminPortfolioGallery";
import { requireAdmin } from "@/lib/auth";
import { getCategories } from "@/lib/categories";
import { getPortfolioItems } from "@/lib/portfolio";

export const metadata: Metadata = { title: "Portofolio" };
const notices: Record<string, string> = { baru: "Foto baru sudah tampil di website.", edit: "Perubahan sudah tampil di website.", hapus: "Foto sudah dihapus dari website." };
export default async function AdminPortfolioPage({ searchParams }: PageProps<"/admin/portofolio">) {
  const admin = await requireAdmin();
  const [items, categories, { disimpan }] = await Promise.all([getPortfolioItems(), getCategories(), searchParams]);
  const notice = typeof disimpan === "string" ? notices[disimpan] : undefined;
  const metrics = [{ label: "foto portofolio", value: items.length }, { label: "tampil di Home", value: items.filter(i => i.featured).length }, { label: "Before–After", value: items.filter(i => i.beforeImageUrl).length }];
  return <><AdminHeader email={admin.email} current="/admin/portofolio" /><div className="admin-content mx-auto w-full max-w-6xl">
    <div className="admin-page-intro"><div><p className="editorial-label">Admin · Portofolio</p><h1 className="font-heading">Portofolio</h1><p className="editorial-description">{items.length} foto · {items.filter(i => i.featured).length} tampil di Home</p></div><dl className="curator-metrics">{metrics.map(m => <div key={m.label}><dt className="editorial-label">{m.label}</dt><dd className="font-heading">{m.value}</dd></div>)}</dl></div>
    <div className="admin-toolbar"><div className="flex flex-wrap gap-3"><Link href="/admin/portofolio/urutan" className="editorial-button editorial-button-outline">Atur urutan</Link><Link href="/admin/portofolio/kategori" className="editorial-button editorial-button-outline">Kelola kategori</Link></div><Link href="/admin/portofolio/baru" className="editorial-button editorial-button-primary">+ Tambah foto</Link></div>
    {notice && <p role="status" className="my-5 border border-line bg-accent-soft px-5 py-4 text-sm">{notice}</p>}
    <AdminPortfolioGallery items={items} categories={categories} />
  </div></>;
}
