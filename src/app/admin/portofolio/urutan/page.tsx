import type { Metadata } from "next";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import PortfolioOrderEditor from "@/components/admin/PortfolioOrderEditor";
import { getDb } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { getPortfolioItems } from "@/lib/portfolio";

export const metadata: Metadata = { title: "Urutan portofolio" };

export default async function UrutanPortfolioPage() {
  const admin = await requireAdmin();
  const items = await getPortfolioItems();

  return (
    <>
      <AdminHeader email={admin.email} current="/admin/portofolio" />
      <div className="admin-content mx-auto w-full max-w-6xl space-y-6 px-4 py-6">
        <div>
          <Link href="/admin/portofolio" className="text-sm text-accent-strong">
            ← Kembali ke portofolio
          </Link>
          <h1 className="mt-2 font-heading text-4xl">Urutan foto</h1>
          <p className="mt-1 text-sm text-foreground/70">
            Urutan di sini sama dengan urutan foto di halaman Portofolio. Di Home, foto yang ditandai &quot;Tampil di
            Home&quot; didahulukan sesuai urutan ini. Foto baru otomatis masuk paling depan.
          </p>
        </div>

        {!getDb() ? (
          <p className="rounded-none border border-line bg-surface p-4 text-sm">Database belum disambungkan.</p>
        ) : (
          <PortfolioOrderEditor
            items={items.map(({ id, title, categoryLabel, imageUrl, featured }) => ({
              id,
              title,
              categoryLabel,
              imageUrl,
              featured,
            }))}
          />
        )}
      </div>
    </>
  );
}
