import type { Metadata } from "next";
import Link from "next/link";
import AddCategoryForm from "@/components/admin/AddCategoryForm";
import AdminHeader from "@/components/admin/AdminHeader";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { getCategoriesWithUsage } from "@/lib/categories";
import { deleteCategory, moveCategory, renameCategory } from "./actions";

export const metadata: Metadata = { title: "Kategori" };

export default async function KategoriPage() {
  const admin = await requireAdmin();
  const categories = await getCategoriesWithUsage();

  return (
    <>
      <AdminHeader email={admin.email} current="/admin/portofolio" />
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
        <div>
          <Link href="/admin/portofolio" className="text-sm text-accent-strong">
            ← Kembali ke portofolio
          </Link>
          <h1 className="mt-2 font-heading text-3xl font-semibold">Kategori</h1>
          <p className="mt-1 text-sm text-foreground/70">
            Dipakai untuk filter di halaman Portofolio dan pilihan &quot;jenis acara&quot; di testimoni. Urutan di sini
            sama dengan urutan filter di website.
          </p>
        </div>

        {!categories ? (
          <p className="rounded-lg border border-line bg-surface p-4 text-sm">Database belum disambungkan.</p>
        ) : (
          <>
            <AddCategoryForm />

            <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
              {categories.map((c, i) => {
                const used = c.photos + c.testimonials;
                return (
                  <li key={c.id} className="space-y-2 px-3 py-3">
                    <form action={renameCategory} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={c.id} />
                      <input
                        name="label"
                        defaultValue={c.label}
                        required
                        minLength={2}
                        maxLength={30}
                        aria-label={`Nama kategori ${c.label}`}
                        className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-background px-3 text-base outline-none focus:border-accent-strong"
                      />
                      <ConfirmButton pendingLabel="…" className="h-11 shrink-0 rounded-full border border-line px-4 text-sm">
                        Simpan
                      </ConfirmButton>
                    </form>

                    <div className="flex items-center gap-2">
                      {/* Tombol urutan 44x44 px: cukup besar untuk jempol di HP. */}
                      <form action={moveCategory}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button
                          type="submit"
                          disabled={i === 0}
                          aria-label={`Naikkan ${c.label}`}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-base disabled:opacity-25"
                        >
                          ▲
                        </button>
                      </form>
                      <form action={moveCategory}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button
                          type="submit"
                          disabled={i === categories.length - 1}
                          aria-label={`Turunkan ${c.label}`}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-base disabled:opacity-25"
                        >
                          ▼
                        </button>
                      </form>
                      <p className="flex-1 text-xs text-foreground/70">
                        {used > 0
                          ? `Dipakai ${[c.photos && `${c.photos} foto`, c.testimonials && `${c.testimonials} testimoni`].filter(Boolean).join(" · ")}`
                          : "Belum dipakai"}
                      </p>
                      <form action={deleteCategory}>
                        <input type="hidden" name="id" value={c.id} />
                        <ConfirmButton
                          disabled={used > 0}
                          title={used > 0 ? "Pindahkan atau hapus dulu foto/testimoni di kategori ini" : undefined}
                          confirmMessage={`Hapus kategori "${c.label}"?`}
                          className="h-11 rounded-full px-4 text-sm text-red-700 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          Hapus
                        </ConfirmButton>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="text-xs text-foreground/70">
              Kategori yang masih dipakai foto atau testimoni tidak bisa dihapus. Pindahkan dulu fotonya ke kategori lain
              lewat halaman edit foto.
            </p>
          </>
        )}
      </div>
    </>
  );
}
