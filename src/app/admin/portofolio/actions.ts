"use server";

import { eq, inArray, min, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { FormState } from "@/app/admin/actions";
import { getDb } from "@/db";
import { portfolioItems } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { categoryExists } from "@/lib/categories";
import { createSupabaseAdminClient, PORTFOLIO_BUCKET } from "@/lib/supabase/admin";

const MAX_FILE_BYTES = 2 * 1024 * 1024; // sama dengan batas bucket
const ALLOWED_TYPES: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };

const fieldsSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi.").max(80, "Judul maksimal 80 karakter."),
  category: z.string().min(1, "Pilih kategori."),
  description: z.string().trim().max(300, "Deskripsi maksimal 300 karakter."),
  featured: z.boolean(),
});

// Input file kosong tetap terkirim sebagai File berukuran 0.
function fileFrom(formData: FormData, name: string): File | null {
  const value = formData.get(name);
  return value instanceof File && value.size > 0 ? value : null;
}

function fileError(file: File): string | null {
  if (!ALLOWED_TYPES[file.type]) return "Format foto harus JPG, PNG, atau WebP.";
  if (file.size > MAX_FILE_BYTES) return "Ukuran foto maksimal 2 MB.";
  return null;
}

function revalidatePortfolio() {
  for (const path of ["/", "/portfolio", "/admin/portofolio", "/admin/portofolio/urutan"]) revalidatePath(path);
}

export async function savePortfolioItem(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const db = getDb();
  const storage = createSupabaseAdminClient();
  if (!db) return { status: "error", message: "Database belum disambungkan (DATABASE_URL kosong)." };
  if (!storage) return { status: "error", message: "SUPABASE_SECRET_KEY belum diisi, foto belum bisa di-upload." };

  const parsed = fieldsSchema.safeParse({
    title: formData.get("title") ?? "",
    category: formData.get("category") ?? "",
    description: formData.get("description") ?? "",
    featured: formData.get("featured") === "on",
  });
  const fieldErrors: Record<string, string> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
  } else if (!(await categoryExists(parsed.data.category))) {
    fieldErrors.category = "Kategori ini sudah dihapus. Pilih kategori lain.";
  }

  const existingId = String(formData.get("id") ?? "");
  const existing = existingId
    ? (await db.select().from(portfolioItems).where(eq(portfolioItems.id, existingId)))[0]
    : undefined;
  if (existingId && !existing) return { status: "error", message: "Foto ini sudah tidak ada." };

  const image = fileFrom(formData, "image");
  const beforeImage = fileFrom(formData, "beforeImage");
  const removeBefore = formData.get("removeBefore") === "on";

  if (!existing && !image) fieldErrors.image = "Foto wajib dipilih.";
  if (image && fileError(image)) fieldErrors.image = fileError(image)!;
  if (beforeImage && fileError(beforeImage)) fieldErrors.beforeImage = fileError(beforeImage)!;

  if (!parsed.success || Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Ada isian yang perlu diperbaiki.", fieldErrors };
  }

  const id = existing?.id ?? crypto.randomUUID();
  const bucket = storage.storage.from(PORTFOLIO_BUCKET);

  // Upload file baru dulu. Kalau gagal, data lama tidak disentuh sama sekali.
  async function upload(file: File, kind: "main" | "before") {
    const path = `${id}/${Date.now()}-${kind}.${ALLOWED_TYPES[file.type]}`;
    const { error } = await bucket.upload(path, file, { contentType: file.type, cacheControl: "31536000" });
    if (error) throw new Error(error.message);
    return { path, url: bucket.getPublicUrl(path).data.publicUrl };
  }

  let main: { path: string; url: string } | null = null;
  let before: { path: string; url: string } | null = null;
  try {
    if (image) main = await upload(image, "main");
    if (beforeImage) before = await upload(beforeImage, "before");
  } catch (err) {
    const uploaded = [main?.path, before?.path].filter((p): p is string => Boolean(p));
    if (uploaded.length) await bucket.remove(uploaded);
    console.error("[portfolio] upload gagal:", err);
    return { status: "error", message: "Upload foto gagal. Coba lagi." };
  }

  const values = {
    title: parsed.data.title,
    category: parsed.data.category,
    description: parsed.data.description || null,
    featured: parsed.data.featured,
    ...(main ? { imageUrl: main.url, imagePath: main.path } : {}),
    ...(before
      ? { beforeImageUrl: before.url, beforeImagePath: before.path }
      : removeBefore
        ? { beforeImageUrl: null, beforeImagePath: null }
        : {}),
  };

  if (existing) {
    await db.update(portfolioItems).set({ ...values, updatedAt: sql`now()` }).where(eq(portfolioItems.id, id));
    // File lama yang sudah diganti/dihapus dibuang dari Storage (foto dummy Unsplash tidak punya path).
    const stale = [
      main ? existing.imagePath : null,
      before || removeBefore ? existing.beforeImagePath : null,
    ].filter((p): p is string => Boolean(p));
    if (stale.length) await bucket.remove(stale);
  } else {
    // Foto baru langsung di urutan paling depan.
    const [{ first }] = await db.select({ first: min(portfolioItems.sortOrder) }).from(portfolioItems);
    await db
      .insert(portfolioItems)
      .values({ id, ...values, imageUrl: main!.url, imagePath: main!.path, sortOrder: (first ?? 1) - 1 });
  }

  revalidatePortfolio();
  redirect(`/admin/portofolio?disimpan=${existing ? "edit" : "baru"}`);
}

export async function deletePortfolioItem(formData: FormData): Promise<void> {
  await requireAdmin();
  const db = getDb();
  if (!db) return;

  const id = String(formData.get("id") ?? "");
  const [row] = await db.delete(portfolioItems).where(eq(portfolioItems.id, id)).returning();
  if (row) {
    const paths = [row.imagePath, row.beforeImagePath].filter((p): p is string => Boolean(p));
    const storage = createSupabaseAdminClient();
    if (paths.length && storage) await storage.storage.from(PORTFOLIO_BUCKET).remove(paths);
  }

  revalidatePortfolio();
  redirect("/admin/portofolio?disimpan=hapus");
}

const orderSchema = z.array(z.string().min(1)).min(1).max(1000);

// Simpan urutan baru sekaligus. `ids` = semua id foto, urut dari yang tampil paling depan.
export async function reorderPortfolio(ids: string[]): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const db = getDb();
  if (!db) return { ok: false, message: "Database belum disambungkan." };
  const parsed = orderSchema.safeParse(ids);
  if (!parsed.success) return { ok: false, message: "Urutan tidak valid." };

  // Daftar harus persis sama dengan isi database: kalau ada foto yang ditambah/dihapus
  // di tab lain sejak halaman dibuka, jangan simpan urutan yang sudah basi.
  const current = await db.select({ id: portfolioItems.id }).from(portfolioItems);
  const known = new Set(current.map((r) => r.id));
  if (new Set(parsed.data).size !== parsed.data.length || parsed.data.length !== known.size || parsed.data.some((id) => !known.has(id))) {
    return { ok: false, message: "Daftar foto sudah berubah. Muat ulang halaman lalu atur lagi." };
  }

  // Satu query untuk semua foto: CASE id WHEN ... THEN posisi.
  const positions = sql.join(
    parsed.data.map((id, i) => sql`when ${id} then ${i + 1}::int`),
    sql` `,
  );
  await db
    .update(portfolioItems)
    .set({ sortOrder: sql`case ${portfolioItems.id} ${positions} end` })
    .where(inArray(portfolioItems.id, parsed.data));

  revalidatePortfolio();
  return { ok: true, message: "Urutan disimpan dan sudah tampil di website." };
}
