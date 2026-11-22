import type { Metadata } from "next";
import { deleteBrand, moveBrand, renameBrand } from "@/app/admin/brand/actions";
import AdminHeader from "@/components/admin/AdminHeader";
import BrandUploader from "@/components/admin/BrandUploader";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { getDb } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { getBrands } from "@/lib/brands";

export const metadata: Metadata = { title: "Brand" };

export default async function AdminBrandPage() {
  const admin = await requireAdmin();
  const brands = await getBrands();

  return (
    <>
      <AdminHeader email={admin.email} current="/admin/brand" />
      <div className="admin-content mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
        <h1 className="font-heading text-4xl">Brand produk</h1>
        {!getDb() ? (
          <p className="border border-line bg-surface p-4 text-sm">Database belum disambungkan.</p>
        ) : (
          <>
            <BrandUploader />
            <ul className="divide-y divide-line border border-line bg-surface">
              {brands.map((brand, index) => (
                <li key={brand.id} className="flex flex-wrap items-center gap-3 px-3 py-3">
                  <div className="flex h-14 w-24 shrink-0 items-center justify-center border border-line bg-white p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element -- logo kecil, tidak perlu dioptimasi */}
                    <img src={brand.logo} alt="" className="max-h-full max-w-full object-contain" />
                  </div>
                  <form action={renameBrand} className="flex min-w-0 flex-1 gap-2">
                    <input type="hidden" name="id" value={brand.id} />
                    <input name="name" defaultValue={brand.name} maxLength={40} aria-label={`Nama ${brand.name}`} className="min-h-11 min-w-0 flex-1 border border-line bg-background px-3 text-base outline-none focus:border-accent-strong" />
                    <ConfirmButton pendingLabel="…" className="min-h-11 px-3 text-sm text-accent-strong">Simpan</ConfirmButton>
                  </form>
                  <div className="flex gap-1">
                    {(["up", "down"] as const).map((dir) => (
                      <form key={dir} action={moveBrand}>
                        <input type="hidden" name="id" value={brand.id} />
                        <input type="hidden" name="dir" value={dir} />
                        <ConfirmButton
                          disabled={dir === "up" ? index === 0 : index === brands.length - 1}
                          aria-label={`${dir === "up" ? "Naikkan" : "Turunkan"} ${brand.name}`}
                          className="h-11 w-11 border border-line text-sm disabled:opacity-25"
                        >
                          {dir === "up" ? "▲" : "▼"}
                        </ConfirmButton>
                      </form>
                    ))}
                    <form action={deleteBrand}>
                      <input type="hidden" name="id" value={brand.id} />
                      <ConfirmButton confirmMessage={`Hapus logo ${brand.name}?`} aria-label={`Hapus ${brand.name}`} className="h-11 px-3 text-sm text-red-700">Hapus</ConfirmButton>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
