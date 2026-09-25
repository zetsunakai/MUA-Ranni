import type { Metadata } from "next";
import AdminHeader from "@/components/admin/AdminHeader";
import PriceEditor from "@/components/admin/PriceEditor";
import { getDb } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { getAddOns, getServiceGroups } from "@/lib/prices";

export const metadata: Metadata = { title: "Harga" };

export default async function HargaPage() {
  // Cek hak admin di halaman itu sendiri (bukan hanya di proxy/layout).
  const admin = await requireAdmin();
  const [groups, addOns] = await Promise.all([getServiceGroups(), getAddOns()]);

  return (
    <>
      <AdminHeader email={admin.email} />
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <h1 className="font-heading text-3xl font-semibold">Harga</h1>
        <p className="mt-1 text-sm text-foreground/70">
          Ubah angka lalu tekan Simpan. Harga di website langsung ikut berubah.
        </p>

        {getDb() ? (
          <div className="mt-6">
            <PriceEditor groups={groups} addOns={addOns} />
          </div>
        ) : (
          <p className="mt-6 rounded-lg border border-line bg-surface p-4 text-sm">
            Database belum disambungkan (<code>DATABASE_URL</code> kosong), jadi harga belum bisa diubah.
          </p>
        )}
      </div>
    </>
  );
}
