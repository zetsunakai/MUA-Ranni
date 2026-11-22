import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteExpense } from "@/app/admin/belanja/actions";
import AdminHeader from "@/components/admin/AdminHeader";
import ConfirmButton from "@/components/admin/ConfirmButton";
import ExpenseForm from "@/components/admin/ExpenseForm";
import { requireAdmin } from "@/lib/auth";
import { getExpense } from "@/lib/expenses";

export const metadata: Metadata = { title: "Edit belanja" };

export default async function EditExpensePage({ params }: PageProps<"/admin/belanja/[id]">) {
  const admin = await requireAdmin();
  const { id } = await params;
  const expense = await getExpense(id);
  if (!expense) notFound();

  return (
    <>
      <AdminHeader email={admin.email} current="/admin/belanja" />
      <div className="admin-content mx-auto w-full max-w-3xl px-4 py-6">
        <Link href={`/admin/belanja?bulan=${expense.spentOn.slice(0, 7)}`} className="text-sm text-accent-strong">← Kembali</Link>
        <h1 className="mt-2 font-heading text-4xl">Edit belanja</h1>
        <div className="mt-6">
          <ExpenseForm
            key={expense.id}
            draft={{
              id: expense.id,
              spentOn: expense.spentOn,
              category: expense.category,
              item: expense.item,
              store: expense.store ?? "",
              amount: expense.amount,
              note: expense.note ?? "",
            }}
          />
        </div>
        <form action={deleteExpense} className="border-t border-line pt-6 pb-28">
          <input type="hidden" name="id" value={expense.id} />
          <ConfirmButton confirmMessage={`Hapus catatan "${expense.item}"?`} pendingLabel="Menghapus…" className="min-h-11 text-sm text-red-700">
            Hapus catatan belanja
          </ConfirmButton>
        </form>
      </div>
    </>
  );
}
