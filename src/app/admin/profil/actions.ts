"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/app/admin/actions";
import { getDb } from "@/db";
import { siteProfile } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { isGoogleMapsUrl } from "@/lib/maps";
import { normalizeHandle, normalizeWhatsapp, parseBankLines } from "@/lib/profile-format";
import { createSupabaseAdminClient, PORTFOLIO_BUCKET } from "@/lib/supabase/admin";

const PHOTO_TYPES: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

const lines = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

// Paragraf bio dipisah baris kosong.
const paragraphs = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);

const schema = z.object({
  responseHours: z.string().trim().min(3, "Isi jam respon.").max(60, "Maksimal 60 karakter."),
  greeting: z.string().trim().min(3, "Isi sapaan.").max(60, "Maksimal 60 karakter."),
  serviceAreas: z.array(z.string().max(40, "Nama area maksimal 40 karakter.")).min(1, "Isi minimal 1 area.").max(8, "Maksimal 8 area."),
  bio: z.array(z.string().max(600, "Satu paragraf maksimal 600 karakter.")).min(1, "Isi bio minimal 1 paragraf.").max(5, "Maksimal 5 paragraf."),
  depositInfo: z.string().trim().min(3, "Isi info DP.").max(300, "Maksimal 300 karakter."),
  paymentInfo: z.string().trim().min(3, "Isi info pelunasan.").max(300, "Maksimal 300 karakter."),
  terms: z.array(z.string().max(300, "Satu poin maksimal 300 karakter.")).min(1, "Isi minimal 1 poin.").max(15, "Maksimal 15 poin."),
  locationName: z.string().trim().min(2, "Isi nama lokasi.").max(60, "Maksimal 60 karakter."),
  locationAddress: z.string().trim().min(5, "Isi alamat.").max(200, "Maksimal 200 karakter."),
  locationMapsUrl: z.string().trim().max(500).refine((v) => !v || isGoogleMapsUrl(v), "Gunakan link dari Google Maps."),
  bankAccountName: z.string().trim().min(2, "Isi nama pemilik rekening.").max(60, "Maksimal 60 karakter."),
});

export async function saveProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const db = getDb();
  if (!db) return { status: "error", message: "Database belum disambungkan." };

  const fieldErrors: Record<string, string> = {};
  const whatsappNumber = normalizeWhatsapp(String(formData.get("whatsapp") ?? ""));
  if (!whatsappNumber) fieldErrors.whatsapp = "Nomor WhatsApp tidak valid. Contoh: 0831-3635-9324";

  const instagramHandle = normalizeHandle(String(formData.get("instagram") ?? ""));
  if (!instagramHandle) fieldErrors.instagram = "Username Instagram tidak valid. Contoh: rannitary_makeup";

  const tiktokRaw = String(formData.get("tiktok") ?? "").trim();
  const tiktokHandle = tiktokRaw ? normalizeHandle(tiktokRaw) : "";
  if (tiktokHandle === null) fieldErrors.tiktok = "Username TikTok tidak valid (kosongkan kalau tidak ada).";

  const parsed = schema.safeParse({
    responseHours: formData.get("responseHours") ?? "",
    greeting: formData.get("greeting") ?? "",
    serviceAreas: lines(formData.get("serviceAreas")),
    bio: paragraphs(formData.get("bio")),
    depositInfo: formData.get("depositInfo") ?? "",
    paymentInfo: formData.get("paymentInfo") ?? "",
    terms: lines(formData.get("terms")),
    locationName: formData.get("locationName") ?? "",
    locationAddress: formData.get("locationAddress") ?? "",
    locationMapsUrl: formData.get("locationMapsUrl") ?? "",
    bankAccountName: formData.get("bankAccountName") ?? "",
  });
  const bank = parseBankLines(String(formData.get("bankAccounts") ?? ""));
  if (bank.invalid.length) fieldErrors.bankAccounts = `Baris tidak dikenali: "${bank.invalid[0]}". Format: nama bank lalu nomor, mis. BCA 7175262261`;
  else if (bank.accounts.length === 0) fieldErrors.bankAccounts = "Isi minimal 1 rekening.";
  else if (bank.accounts.length > 5) fieldErrors.bankAccounts = "Maksimal 5 rekening.";

  const photoEntry = formData.get("photo");
  const photo = photoEntry instanceof File && photoEntry.size > 0 ? photoEntry : null;
  if (photo && !PHOTO_TYPES[photo.type]) fieldErrors.photo = "Format foto harus JPG, PNG, atau WebP.";
  else if (photo && photo.size > MAX_PHOTO_BYTES) fieldErrors.photo = "Ukuran foto maksimal 2 MB.";
  if (!parsed.success) {
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
  }

  if (!parsed.success || Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Ada isian yang perlu diperbaiki.", fieldErrors };
  }

  // Foto baru di-upload dulu; kalau gagal, profil tidak disimpan sama sekali.
  const [current] = await db.select({ photoPath: siteProfile.photoPath }).from(siteProfile).where(eq(siteProfile.id, 1));
  let photoValues = {};
  if (photo) {
    const storage = createSupabaseAdminClient();
    if (!storage) return { status: "error", message: "SUPABASE_SECRET_KEY belum diisi, foto belum bisa di-upload." };
    const bucket = storage.storage.from(PORTFOLIO_BUCKET);
    const path = `profile/${Date.now()}.${PHOTO_TYPES[photo.type]}`;
    const { error } = await bucket.upload(path, photo, { contentType: photo.type, cacheControl: "31536000" });
    if (error) {
      console.error("[profil] upload foto gagal:", error.message);
      return { status: "error", message: "Upload foto gagal. Coba lagi." };
    }
    photoValues = { photoUrl: bucket.getPublicUrl(path).data.publicUrl, photoPath: path };
  }

  const { locationMapsUrl, ...rest } = parsed.data;
  const values = {
    whatsappNumber: whatsappNumber!,
    instagramHandle: instagramHandle!,
    tiktokHandle: tiktokHandle || "", // "" = sengaja tidak punya TikTok
    ...rest,
    locationMapsUrl: locationMapsUrl || null,
    bankAccounts: bank.accounts,
    ...photoValues,
  };
  await db
    .insert(siteProfile)
    .values({ id: 1, ...values })
    .onConflictDoUpdate({ target: siteProfile.id, set: { ...values, updatedAt: sql`now()` } });

  if (photo && current?.photoPath) await createSupabaseAdminClient()?.storage.from(PORTFOLIO_BUCKET).remove([current.photoPath]);

  // Profil tampil di footer semua halaman, jadi seluruh website dibuat ulang.
  revalidatePath("/", "layout");
  return { status: "success", message: "Profil tersimpan. Website sudah diperbarui." };
}
