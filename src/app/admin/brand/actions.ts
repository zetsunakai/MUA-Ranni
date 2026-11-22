"use server";

import { randomUUID } from "node:crypto";
import { asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/app/admin/actions";
import { getDb } from "@/db";
import { brands } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient, PORTFOLIO_BUCKET } from "@/lib/supabase/admin";

const TYPES: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };
const MAX_BYTES = 2 * 1024 * 1024;

const schema = z.object({
  name: z.string().trim().min(1, "Nama brand wajib diisi.").max(40, "Maksimal 40 karakter."),
  width: z.coerce.number().int().min(1).max(5000),
  height: z.coerce.number().int().min(1).max(5000),
});

function revalidateBrands() {
  for (const path of ["/tentang", "/layanan", "/faq", "/admin/brand"]) revalidatePath(path);
}

export async function addBrand(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const db = getDb();
  const storage = createSupabaseAdminClient();
  if (!db) return { status: "error", message: "Database belum disambungkan." };
  if (!storage) return { status: "error", message: "SUPABASE_SECRET_KEY belum diisi, logo belum bisa di-upload." };

  const parsed = schema.safeParse({ name: formData.get("name") ?? "", width: formData.get("width"), height: formData.get("height") });
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) return { status: "error", message: "Pilih file logo." };
  if (!TYPES[file.type]) return { status: "error", message: "Logo harus PNG, JPG, atau WebP." };
  if (file.size > MAX_BYTES) return { status: "error", message: "Ukuran logo maksimal 2 MB." };
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };

  const id = randomUUID();
  const bucket = storage.storage.from(PORTFOLIO_BUCKET);
  const path = `brands/${id}.${TYPES[file.type]}`;
  const { error } = await bucket.upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) {
    console.error("[brand] upload gagal:", error.message);
    return { status: "error", message: "Upload logo gagal. Coba lagi." };
  }

  const [last] = await db.select({ max: sql<number | null>`max(${brands.sortOrder})` }).from(brands);
  await db.insert(brands).values({
    id,
    name: parsed.data.name,
    logoUrl: bucket.getPublicUrl(path).data.publicUrl,
    logoPath: path,
    width: parsed.data.width,
    height: parsed.data.height,
    sortOrder: (last?.max ?? -1) + 1,
  });
  revalidateBrands();
  return { status: "success", message: `${parsed.data.name} ditambahkan.` };
}

export async function deleteBrand(formData: FormData): Promise<void> {
  await requireAdmin();
  const db = getDb();
  if (!db) return;
  const [row] = await db.delete(brands).where(eq(brands.id, String(formData.get("id") ?? ""))).returning();
  if (row?.logoPath) await createSupabaseAdminClient()?.storage.from(PORTFOLIO_BUCKET).remove([row.logoPath]);
  revalidateBrands();
}

export async function moveBrand(formData: FormData): Promise<void> {
  await requireAdmin();
  const db = getDb();
  if (!db) return;
  const id = String(formData.get("id") ?? "");
  const dir = formData.get("dir") === "up" ? -1 : 1;
  const rows = await db.select({ id: brands.id }).from(brands).orderBy(asc(brands.sortOrder));
  const index = rows.findIndex((r) => r.id === id);
  const target = index + dir;
  if (index < 0 || target < 0 || target >= rows.length) return;
  [rows[index], rows[target]] = [rows[target], rows[index]];
  await db.transaction(async (tx) => {
    for (const [i, r] of rows.entries()) await tx.update(brands).set({ sortOrder: i }).where(eq(brands.id, r.id));
  });
  revalidateBrands();
}

export async function renameBrand(formData: FormData): Promise<void> {
  await requireAdmin();
  const db = getDb();
  if (!db) return;
  const name = z.string().trim().min(1).max(40).safeParse(formData.get("name") ?? "");
  if (!name.success) return;
  await db.update(brands).set({ name: name.data }).where(eq(brands.id, String(formData.get("id") ?? "")));
  revalidateBrands();
}
