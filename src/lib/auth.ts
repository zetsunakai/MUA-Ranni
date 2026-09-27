import "server-only";

import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Hanya email di ADMIN_EMAILS (dipisah koma) yang boleh masuk admin.
// Lapisan kedua di samping mematikan pendaftaran akun di dashboard Supabase.
export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

// Admin yang sedang login, atau null. getClaims() memverifikasi tanda tangan token,
// jadi isi cookie tidak bisa dipalsukan (beda dengan getSession()).
export const getAdmin = cache(async (): Promise<{ email: string } | null> => {
  // Hasilnya beda per pengunjung, jadi jangan pernah di-render statis saat build.
  await connection();
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email as string | undefined;
  return email && isAdminEmail(email) ? { email } : null;
});

// Panggil di SETIAP halaman admin dan SETIAP Server Action yang mengubah data.
export async function requireAdmin(): Promise<{ email: string }> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
