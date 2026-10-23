import type { Metadata } from "next";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import PortfolioForm from "@/components/admin/PortfolioForm";
import { requireAdmin } from "@/lib/auth";
import { getCategories } from "@/lib/categories";

export const metadata: Metadata = { title: "Tambah foto" };

export default async function NewPortfolioPage() {
  const admin = await requireAdmin();
  const categories = await getCategories();
  return (
    <>
      <AdminHeader email={admin.email} current="/admin/portofolio" />
      <div className="admin-content mx-auto w-full max-w-6xl px-4 py-6">
        <Link href="/admin/portofolio" className="text-sm text-accent-strong">
          ← Kembali
        </Link>
        <h1 className="mt-2 font-heading text-4xl">Tambah foto</h1>
        <div className="mt-6">
          <PortfolioForm categories={categories} />
        </div>
      </div>
    </>
  );
}
