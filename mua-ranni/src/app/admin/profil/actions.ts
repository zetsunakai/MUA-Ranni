"use server";

import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/app/admin/actions";
import { getDb } from "@/db";
import { siteProfile } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { normalizeHandle, normalizeWhatsapp } from "@/lib/profile-format";

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
  });
  if (!parsed.success) {
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
  }

  if (!parsed.success || Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Ada isian yang perlu diperbaiki.", fieldErrors };
  }

  const values = {
    whatsappNumber: whatsappNumber!,
    instagramHandle: instagramHandle!,
    tiktokHandle: tiktokHandle || "", // "" = sengaja tidak punya TikTok
    ...parsed.data,
  };
  await db
    .insert(siteProfile)
    .values({ id: 1, ...values })
    .onConflictDoUpdate({ target: siteProfile.id, set: { ...values, updatedAt: sql`now()` } });

  // Profil tampil di footer semua halaman, jadi seluruh website dibuat ulang.
  revalidatePath("/", "layout");
  return { status: "success", message: "Profil tersimpan. Website sudah diperbarui." };
}
