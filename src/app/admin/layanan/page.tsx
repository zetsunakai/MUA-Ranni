import type { Metadata } from "next";
import AdminHeader from "@/components/admin/AdminHeader";
import ServicesEditor from "@/components/admin/ServicesEditor";
import { getDb } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { getAddOns, getServiceGroups } from "@/lib/prices";

export const metadata: Metadata = { title: "Layanan" };

export default async function LayananAdminPage() {
  const admin = await requireAdmin();
  const [groups, addOns] = await Promise.all([getServiceGroups(), getAddOns()]);

  return (
    <>
      <AdminHeader email={admin.email} current="/admin/layanan" />
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <h1 className="font-heading text-3xl font-semibold">Layanan & Harga</h1>
        <p className="mt-1 text-sm text-foreground/70">
          Ubah nama, bonus, dan harga lalu tekan <b>Simpan</b>. Tombol tambah, hapus, dan ▲▼ langsung tersimpan.
        </p>

        {getDb() ? (
          <div className="mt-6">
            <ServicesEditor groups={groups} addOns={addOns} />
          </div>
        ) : (
          <p className="mt-6 rounded-lg border border-line bg-surface p-4 text-sm">
            Database belum disambungkan (<code>DATABASE_URL</code> kosong).
          </p>
        )}
      </div>
    </>
  );
}
