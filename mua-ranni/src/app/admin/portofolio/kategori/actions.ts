"use server";

import { asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/app/admin/actions";
import { getDb } from "@/db";
import { categoryTable, portfolioItems, testimonials } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { slugify, uniqueId } from "@/lib/slug";

const labelSchema = z.string().trim().min(2, "Nama kategori minimal 2 huruf.").max(30, "Maksimal 30 karakter.");

function revalidateCategories() {
  for (const path of ["/", "/portfolio", "/admin/portofolio", "/admin/portofolio/kategori", "/admin/testimoni"]) {
    revalidatePath(path);
  }
}

export async function addCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const db = getDb();
  if (!db) return { status: "error", message: "Database belum disambungkan." };

  const parsed = labelSchema.safeParse(formData.get("label") ?? "");
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };
  const label = parsed.data;

  const existing = await db.select().from(categoryTable);
  if (existing.some((c) => c.label.toLowerCase() === label.toLowerCase())) {
    return { status: "error", message: `Kategori "${label}" sudah ada.` };
  }
  const id = uniqueId(slugify(label), existing.map((c) => c.id));
  const sortOrder = Math.max(0, ...existing.map((c) => c.sortOrder)) + 1;

  await db.insert(categoryTable).values({ id, label, sortOrder });
  revalidateCategories();
  return { status: "success", message: `Kategori "${label}" ditambahkan.` };
}

export async function renameCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const db = getDb();
  const parsed = labelSchema.safeParse(formData.get("label") ?? "");
  if (!db || !parsed.success) return;
  await db.update(categoryTable).set({ label: parsed.data }).where(eq(categoryTable.id, String(formData.get("id"))));
  revalidateCategories();
}

// Tukar urutan dengan tetangga di atas/bawahnya.
export async function moveCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const db = getDb();
  if (!db) return;
  const id = String(formData.get("id"));
  const direction = formData.get("direction") === "up" ? -1 : 1;

  const list = await db.select().from(categoryTable).orderBy(asc(categoryTable.sortOrder));
  const index = list.findIndex((c) => c.id === id);
  const other = list[index + direction];
  if (index < 0 || !other) return;

  await db.transaction(async (tx) => {
    await tx.update(categoryTable).set({ sortOrder: other.sortOrder }).where(eq(categoryTable.id, id));
    await tx.update(categoryTable).set({ sortOrder: list[index].sortOrder }).where(eq(categoryTable.id, other.id));
  });
  revalidateCategories();
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const db = getDb();
  if (!db) return;
  const id = String(formData.get("id"));

  // Dicek di sini dan dijaga juga oleh foreign key (ON DELETE RESTRICT) di database.
  const [{ used }] = await db
    .select({
      used: sql<number>`(select count(*)::int from ${portfolioItems} where ${portfolioItems.category} = ${id})
        + (select count(*)::int from ${testimonials} where ${testimonials.eventType} = ${id})`,
    })
    .from(sql`(select 1) as one`);
  if (used > 0) return;

  await db.delete(categoryTable).where(eq(categoryTable.id, id));
  revalidateCategories();
}
