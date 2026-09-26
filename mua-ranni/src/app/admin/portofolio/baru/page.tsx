import type { Metadata } from "next";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import PortfolioForm from "@/components/admin/PortfolioForm";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Tambah foto" };

export default async function NewPortfolioPage() {
  const admin = await requireAdmin();
  return (
    <>
      <AdminHeader email={admin.email} current="/admin/portofolio" />
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <Link href="/admin/portofolio" className="text-sm text-accent-strong">
          ← Kembali
        </Link>
        <h1 className="mt-2 font-heading text-3xl font-semibold">Tambah foto</h1>
        <div className="mt-6">
          <PortfolioForm />
        </div>
      </div>
    </>
  );
}
