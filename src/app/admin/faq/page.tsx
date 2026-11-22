import type { Metadata } from "next";
import { resetFaqs } from "@/app/admin/faq/actions";
import AdminHeader from "@/components/admin/AdminHeader";
import ConfirmButton from "@/components/admin/ConfirmButton";
import FaqEditor from "@/components/admin/FaqEditor";
import { getDb } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { getFaqs } from "@/lib/faqs";

export const metadata: Metadata = { title: "FAQ" };

export default async function AdminFaqPage() {
  const admin = await requireAdmin();
  const { faqs, isDefault } = await getFaqs();

  return (
    <>
      <AdminHeader email={admin.email} current="/admin/faq" />
      <div className="admin-content mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
        <h1 className="font-heading text-4xl">FAQ</h1>
        {!getDb() ? (
          <p className="border border-line bg-surface p-4 text-sm">Database belum disambungkan.</p>
        ) : (
          <>
            {isDefault ? (
              <p className="bg-accent-soft p-4 text-sm">
                Ini FAQ otomatis: jawabannya dirangkai dari harga, aturan booking, profil, dan brand, jadi ikut berubah sendiri.
                Setelah kamu menekan Simpan, FAQ dikunci jadi teks yang kamu tulis di sini.
              </p>
            ) : (
              <form action={resetFaqs} className="flex flex-wrap items-center justify-between gap-3 bg-accent-soft p-4 text-sm">
                <span>FAQ ini ditulis manual.</span>
                <ConfirmButton confirmMessage="Hapus semua FAQ manual dan kembali ke FAQ otomatis?" pendingLabel="Memproses…" className="min-h-11 text-accent-strong underline underline-offset-4">
                  Kembali ke FAQ otomatis
                </ConfirmButton>
              </form>
            )}
            <FaqEditor key={isDefault ? "default" : faqs.map((f) => f.q).join("|")} initial={faqs} />
          </>
        )}
      </div>
    </>
  );
}
