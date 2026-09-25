"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { addOns, serviceItems } from "@/db/schema";
import { isAdminEmail, requireAdmin } from "@/lib/auth";
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
  redirect("/admin/harga");
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

// ---------- Update harga ----------

const MAX_PRICE = 100_000_000;
const priceSchema = z.number().int().min(0, "Tidak boleh minus.").max(MAX_PRICE, "Terlalu besar.");

// "150.000" / "Rp150.000" / "150000" -> 150000. Kosong -> null.
function parsePrice(value: FormDataEntryValue | null): number | null {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits === "" ? null : Number(digits);
}

export async function updatePrices(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const db = getDb();
  if (!db) return { status: "error", message: "Database belum disambungkan (DATABASE_URL kosong)." };

  const fieldErrors: Record<string, string> = {};
  const itemPrices = new Map<string, number>();
  const addOnPrices = new Map<string, { from: number; to: number | null }>();

  for (const [key, raw] of formData.entries()) {
    const [kind, id, part] = key.split(":");
    if (kind === "item") {
      const price = parsePrice(raw);
      const check = priceSchema.safeParse(price);
      if (price === null) fieldErrors[key] = "Harga wajib diisi.";
      else if (!check.success) fieldErrors[key] = check.error.issues[0].message;
      else itemPrices.set(id, price);
    }
    if (kind === "addon" && part === "from") {
      const from = parsePrice(raw);
      const to = parsePrice(formData.get(`addon:${id}:to`));
      if (from === null) fieldErrors[key] = "Harga wajib diisi.";
      else if (!priceSchema.safeParse(from).success) fieldErrors[key] = "Harga tidak valid.";
      else if (to !== null && !priceSchema.safeParse(to).success) fieldErrors[`addon:${id}:to`] = "Harga tidak valid.";
      else if (to !== null && to <= from) fieldErrors[`addon:${id}:to`] = "Harus lebih besar dari harga awal.";
      else addOnPrices.set(id, { from, to });
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Ada harga yang perlu diperbaiki.", fieldErrors };
  }

  // Hanya baris yang harganya berubah yang ditulis ke database.
  const [currentItems, currentAddOns] = await Promise.all([
    db.select({ id: serviceItems.id, price: serviceItems.price }).from(serviceItems),
    db.select({ id: addOns.id, from: addOns.priceFrom, to: addOns.priceTo }).from(addOns),
  ]);
  const changedItems = currentItems.filter((row) => itemPrices.has(row.id) && itemPrices.get(row.id) !== row.price);
  const changedAddOns = currentAddOns.filter((row) => {
    const next = addOnPrices.get(row.id);
    return next && (next.from !== row.from || next.to !== row.to);
  });

  const changed = changedItems.length + changedAddOns.length;
  if (changed === 0) return { status: "success", message: "Tidak ada harga yang berubah." };

  await db.transaction(async (tx) => {
    for (const row of changedItems) {
      await tx
        .update(serviceItems)
        .set({ price: itemPrices.get(row.id)!, updatedAt: sql`now()` })
        .where(eq(serviceItems.id, row.id));
    }
    for (const row of changedAddOns) {
      const next = addOnPrices.get(row.id)!;
      await tx
        .update(addOns)
        .set({ priceFrom: next.from, priceTo: next.to, updatedAt: sql`now()` })
        .where(eq(addOns.id, row.id));
    }
  });

  // Buat ulang halaman publik yang menampilkan harga, plus halaman admin ini.
  for (const path of ["/", "/layanan", "/tentang", "/admin/harga"]) revalidatePath(path);

  return { status: "success", message: `${changed} harga berhasil diperbarui. Website sudah memakai harga baru.` };
}
