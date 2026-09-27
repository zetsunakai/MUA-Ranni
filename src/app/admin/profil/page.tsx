import type { Metadata } from "next";
import AdminHeader from "@/components/admin/AdminHeader";
import ProfileForm from "@/components/admin/ProfileForm";
import { getDb } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { getProfile } from "@/lib/profile";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilPage() {
  const admin = await requireAdmin();
  const profile = await getProfile();

  return (
    <>
      <AdminHeader email={admin.email} current="/admin/profil" />
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <h1 className="font-heading text-4xl">Profil</h1>
        <p className="mt-1 text-sm text-foreground/70">Kontak, area layanan, dan bio yang tampil di website.</p>
        {getDb() ? (
          <div className="mt-6">
            <ProfileForm profile={profile} />
          </div>
        ) : (
          <p className="mt-6 rounded-lg border border-line bg-surface p-4 text-sm">Database belum disambungkan.</p>
        )}
      </div>
    </>
  );
}
