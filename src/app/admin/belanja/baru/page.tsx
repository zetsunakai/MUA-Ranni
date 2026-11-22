import type { Metadata } from "next";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import ExpenseForm from "@/components/admin/ExpenseForm";
import { requireAdmin } from "@/lib/auth";
import { todayInJakarta } from "@/lib/dates";

export const metadata: Metadata = { title: "Catat belanja" };

export default async function NewExpensePage() {
  const admin = await requireAdmin();

  return (
    <>
      <AdminHeader email={admin.email} current="/admin/belanja" />
      <div className="admin-content mx-auto w-full max-w-3xl px-4 py-6">
        <Link href="/admin/belanja" className="text-sm text-accent-strong">← Kembali</Link>
        <h1 className="mt-2 font-heading text-4xl">Catat belanja</h1>
        <div className="mt-6">
          <ExpenseForm draft={{ spentOn: todayInJakarta(), category: "bahan", item: "", store: "", amount: 0, note: "" }} />
        </div>
      </div>
    </>
  );
}
