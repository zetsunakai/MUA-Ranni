import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import DeletePortfolioButton from "@/components/admin/DeletePortfolioButton";
import PortfolioForm from "@/components/admin/PortfolioForm";
import { requireAdmin } from "@/lib/auth";
import { getCategories } from "@/lib/categories";
import { getPortfolioItem } from "@/lib/portfolio";

export const metadata: Metadata = { title: "Edit foto" };

export default async function EditPortfolioPage({ params }: PageProps<"/admin/portofolio/[id]">) {
  const admin = await requireAdmin();
  const categories = await getCategories();
  const { id } = await params;
  const item = await getPortfolioItem(id);
  if (!item) notFound();

  return (
    <>
      <AdminHeader email={admin.email} current="/admin/portofolio" />
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <Link href="/admin/portofolio" className="text-sm text-accent-strong">
          ← Kembali
        </Link>
        <div className="mt-2 flex items-start justify-between gap-3">
          <h1 className="font-heading text-4xl">Edit foto</h1>
          <DeletePortfolioButton id={item.id} title={item.title} />
        </div>
        <div className="mt-6">
          <PortfolioForm key={item.id} item={item} categories={categories} />
        </div>
      </div>
    </>
  );
}
