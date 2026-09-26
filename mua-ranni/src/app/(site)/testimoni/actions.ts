"use server";

import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import type { FormState } from "@/app/admin/actions";
import { getDb } from "@/db";
import { testimonialInvites, testimonials } from "@/db/schema";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkInvite } from "@/lib/testimonials";

// Server Action PUBLIK (dipanggil klien tanpa login). Pengamannya:
// 1. Honeypot  2. Validasi isi  3. Link undangan valid & sekali pakai  4. Moderasi admin.

const TESTIMONIAL_BUCKET = "testimonials";
const MAX_FILE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };
const LINK_PATTERN = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|id|xyz|io|co)\b)/i;

const schema = z.object({
  clientName: z.string().trim().min(2, "Nama minimal 2 huruf.").max(60, "Nama maksimal 60 karakter."),
  eventType: z.enum(["bridal", "wisuda", "engagement", "photoshoot"], "Pilih jenis acara."),
  quote: z
    .string()
    .trim()
    .min(10, "Ceritakan sedikit lebih panjang (minimal 10 karakter).")
    .max(500, "Maksimal 500 karakter.")
    .refine((v) => !LINK_PATTERN.test(v), "Ulasan tidak boleh berisi link."),
  consent: z.literal(true, "Centang izin supaya ulasan bisa ditampilkan."),
});

export async function submitTestimonial(_prev: FormState, formData: FormData): Promise<FormState> {
  // Honeypot: kolom "website" tersembunyi dari manusia. Kalau terisi, hampir pasti bot.
  // Balas "berhasil" supaya bot tidak tahu kirimannya dibuang.
  if (String(formData.get("website") ?? "") !== "") {
    return { status: "success", message: "Ulasanmu sudah terkirim dan akan tampil di website setelah dicek Ranni." };
  }

  const token = String(formData.get("token") ?? "");
  const invite = await checkInvite(token);
  if (!invite.ok) {
    return { status: "error", message: "Link ini sudah dipakai atau sudah tidak berlaku. Minta link baru ke Ranni ya." };
  }

  const parsed = schema.safeParse({
    clientName: formData.get("clientName") ?? "",
    eventType: formData.get("eventType") ?? "",
    quote: formData.get("quote") ?? "",
    consent: formData.get("consent") === "on",
  });
  const fieldErrors: Record<string, string> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
  }

  const photo = formData.get("photo");
  const hasPhoto = photo instanceof File && photo.size > 0;
  if (hasPhoto) {
    if (!ALLOWED_TYPES[photo.type]) fieldErrors.photo = "Format foto harus JPG, PNG, atau WebP.";
    else if (photo.size > MAX_FILE_BYTES) fieldErrors.photo = "Ukuran foto maksimal 2 MB.";
    if (formData.get("photoConsent") !== "on") fieldErrors.photoConsent = "Centang izin foto, atau hapus fotonya.";
  }

  if (!parsed.success || Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Ada isian yang perlu diperbaiki.", fieldErrors };
  }

  const db = getDb()!;
  const id = crypto.randomUUID();
  let photoPath: string | null = null;
  let photoUrl: string | null = null;
  const storage = createSupabaseAdminClient();

  if (hasPhoto) {
    if (!storage) return { status: "error", message: "Upload foto sedang tidak tersedia. Coba kirim tanpa foto." };
    const bucket = storage.storage.from(TESTIMONIAL_BUCKET);
    photoPath = `${id}.${ALLOWED_TYPES[photo.type]}`;
    const { error } = await bucket.upload(photoPath, photo, { contentType: photo.type, cacheControl: "31536000" });
    if (error) {
      console.error("[testimoni] upload gagal:", error.message);
      return { status: "error", message: "Upload foto gagal. Coba lagi, atau kirim tanpa foto." };
    }
    photoUrl = bucket.getPublicUrl(photoPath).data.publicUrl;
  }

  // Klaim undangan secara atomik: hanya berhasil kalau belum dipakai dan belum kedaluwarsa,
  // jadi dua kiriman bersamaan dengan link yang sama tidak mungkin sama-sama lolos.
  const saved = await db.transaction(async (tx) => {
    const claimed = await tx
      .update(testimonialInvites)
      .set({ usedAt: sql`now()` })
      .where(
        and(eq(testimonialInvites.id, token), isNull(testimonialInvites.usedAt), gt(testimonialInvites.expiresAt, new Date())),
      )
      .returning({ id: testimonialInvites.id });
    if (claimed.length === 0) return false;
    await tx.insert(testimonials).values({ id, inviteId: token, ...parsed.data, photoUrl, photoPath, status: "pending" });
    return true;
  });

  if (!saved) {
    if (photoPath && storage) await storage.storage.from(TESTIMONIAL_BUCKET).remove([photoPath]);
    return { status: "error", message: "Link ini sudah dipakai. Minta link baru ke Ranni ya." };
  }

  // Sengaja TANPA revalidatePath: itu akan memuat ulang halaman ini, dan karena link sudah
  // terpakai, pesan terima kasih langsung tergantikan "link tidak bisa dipakai".
  // Halaman admin selalu dibaca ulang dari database, jadi tidak perlu di-revalidate.
  return { status: "success", message: "Ulasanmu sudah terkirim dan akan tampil di website setelah dicek Ranni." };
}
