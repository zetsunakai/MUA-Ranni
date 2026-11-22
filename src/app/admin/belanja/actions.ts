"use server";

import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { FormState } from "@/app/admin/actions";
import { getDb } from "@/db";
import { EXPENSE_CATEGORIES, expenses } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

const optionalText = (max: number) => z.string().trim().max(max, `Maksimal ${max} karakter.`).transform((v) => v || null);

const schema = z.object({
  spentOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid."),
  category: z.enum(EXPENSE_CATEGORIES, "Pilih kategori."),
  item: z.string().trim().min(1, "Nama barang wajib diisi.").max(120, "Maksimal 120 karakter."),
  store: optionalText(80),
  amount: z.coerce.number({ error: "Harga harus angka." }).int().min(1, "Harga wajib diisi.").max(1_000_000_000, "Harga terlalu besar."),
  note: optionalText(300),
});

export async function saveExpense(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const db = getDb();
  if (!db) return { status: "error", message: "Database belum disambungkan." };

  const parsed = schema.safeParse({
    spentOn: formData.get("spentOn") ?? "",
    category: formData.get("category"),
    item: formData.get("item") ?? "",
    store: formData.get("store") ?? "",
    amount: formData.get("amount") ?? "",
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { status: "error", message: parsed.error.issues[0].message, fieldErrors };
  }
  const values = parsed.data;

  const existingId = String(formData.get("id") ?? "");
  if (existingId) {
    const updated = await db.update(expenses).set({ ...values, updatedAt: sql`now()` }).where(eq(expenses.id, existingId)).returning({ id: expenses.id });
    if (updated.length === 0) return { status: "error", message: "Catatan belanja ini sudah tidak ada." };
  } else {
    await db.insert(expenses).values({ id: randomUUID(), ...values });
  }

  revalidatePath("/admin/belanja");
  redirect(`/admin/belanja?bulan=${values.spentOn.slice(0, 7)}`);
}

export async function deleteExpense(formData: FormData): Promise<void> {
  await requireAdmin();
  const db = getDb();
  if (!db) return;
  const id = String(formData.get("id") ?? "");
  const [row] = id ? await db.delete(expenses).where(eq(expenses.id, id)).returning({ spentOn: expenses.spentOn }) : [];
  revalidatePath("/admin/belanja");
  redirect(row ? `/admin/belanja?bulan=${row.spentOn.slice(0, 7)}` : "/admin/belanja");
}
