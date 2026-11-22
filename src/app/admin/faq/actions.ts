"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/app/admin/actions";
import { getDb } from "@/db";
import { faqs } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

const schema = z
  .array(
    z.object({
      q: z.string().trim().min(3, "Pertanyaan minimal 3 karakter.").max(150, "Pertanyaan maksimal 150 karakter."),
      a: z.string().trim().min(3, "Jawaban minimal 3 karakter.").max(1500, "Jawaban maksimal 1500 karakter."),
    }),
  )
  .min(1, "Isi minimal 1 pertanyaan.")
  .max(30, "Maksimal 30 pertanyaan.");

function revalidateFaq() {
  for (const path of ["/faq", "/admin/faq"]) revalidatePath(path);
}

// Simpan seluruh daftar sekaligus (urutan = urutan di layar).
export async function saveFaqs(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const db = getDb();
  if (!db) return { status: "error", message: "Database belum disambungkan." };

  let raw: unknown = [];
  try {
    raw = JSON.parse(String(formData.get("faqs") ?? "[]"));
  } catch {
    return { status: "error", message: "Data FAQ tidak valid." };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const index = typeof issue.path[0] === "number" ? issue.path[0] : null;
    return {
      status: "error",
      message: index === null ? issue.message : `Pertanyaan no. ${index + 1}: ${issue.message}`,
      fieldErrors: index === null ? {} : { [String(index)]: issue.message },
    };
  }

  await db.transaction(async (tx) => {
    await tx.delete(faqs);
    await tx.insert(faqs).values(parsed.data.map((f, i) => ({ id: randomUUID(), question: f.q, answer: f.a, sortOrder: i })));
  });
  revalidateFaq();
  return { status: "success", message: "FAQ tersimpan. Website sudah diperbarui." };
}

// Hapus semua FAQ yang diketik admin: website kembali memakai FAQ otomatis.
export async function resetFaqs(): Promise<void> {
  await requireAdmin();
  const db = getDb();
  if (!db) return;
  await db.delete(faqs);
  revalidateFaq();
}
