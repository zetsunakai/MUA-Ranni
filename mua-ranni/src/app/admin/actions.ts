"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { isAdminEmail } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Server Action = fungsi yang berjalan di server tapi bisa dipanggil dari form.
// Diperlakukan seperti API publik: selalu validasi input dan cek hak akses di dalamnya.

export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string>;
  email?: string; // dikembalikan saat login gagal supaya tidak perlu diketik ulang
};

// ---------- Login / logout ----------

const loginSchema = z.object({
  email: z.email("Format email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
});

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "Supabase belum disambungkan (env belum diisi)." };
  }

  const email = String(formData.get("email") ?? "");
  const parsed = loginSchema.safeParse({ email, password: formData.get("password") });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message, email };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // Kode error asli dicatat di log server (Vercel → Logs) untuk debugging. Password tidak ikut dicatat.
    console.error("[admin login] gagal:", { email, code: error.code, status: error.status, message: error.message });
    return { status: "error", message: loginErrorMessage(error.code), email };
  }
  if (!isAdminEmail(parsed.data.email)) {
    await supabase.auth.signOut();
    return { status: "error", message: "Akun ini tidak punya akses admin.", email };
  }

  // redirect() melempar "error" khusus Next, jadi dipanggil di luar try/catch.
  redirect("/admin");
}

function loginErrorMessage(code: string | undefined): string {
  switch (code) {
    case "invalid_credentials":
      return "Email atau password salah.";
    case "email_not_confirmed":
      return "Email belum dikonfirmasi. Konfirmasi user ini di dashboard Supabase dulu.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.";
    default:
      return "Login gagal. Coba lagi sebentar lagi.";
  }
}

export async function logout(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
