"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/app/admin/actions";
import { getDb } from "@/db";
import { scheduleDays } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid."),
  status: z.enum(["available", "limited", "full"]),
  note: z.string().trim().max(200, "Catatan maksimal 200 karakter."),
});

// available = hapus baris (tanggal tanpa baris dianggap tersedia).
export async function setScheduleDay(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const db = getDb();
  if (!db) return { status: "error", message: "Database belum disambungkan." };

  const parsed = schema.safeParse({
    date: formData.get("date"),
    status: formData.get("status"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };
  const { date, status, note } = parsed.data;

  if (status === "available") {
    await db.delete(scheduleDays).where(eq(scheduleDays.date, date));
  } else {
    await db
      .insert(scheduleDays)
      .values({ date, status, note: note || null })
      .onConflictDoUpdate({ target: scheduleDays.date, set: { status, note: note || null, updatedAt: sql`now()` } });
  }

  revalidatePath("/jadwal");
  revalidatePath("/admin/jadwal");
  return { status: "success", message: "Tersimpan. Kalender di website sudah diperbarui." };
}
