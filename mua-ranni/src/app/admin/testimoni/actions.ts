"use server";

import { randomBytes } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/app/admin/actions";
import { getDb } from "@/db";
import { testimonialInvites, testimonials } from "@/db/schema";
import { site } from "@/data/site";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const INVITE_DAYS = 60;

export type InviteState = FormState & { link?: string; clientName?: string };

const inviteSchema = z.object({
  clientName: z.string().trim().min(1, "Nama klien wajib diisi.").max(60, "Maksimal 60 karakter."),
  eventType: z.enum(["bridal", "wisuda", "engagement", "photoshoot"]).nullable(),
});

export async function createInvite(_prev: InviteState, formData: FormData): Promise<InviteState> {
  await requireAdmin();
  const db = getDb();
  if (!db) return { status: "error", message: "Database belum disambungkan." };

  const parsed = inviteSchema.safeParse({
    clientName: formData.get("clientName") ?? "",
    eventType: formData.get("eventType") || null,
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };

  // 16 byte acak = 128 bit: tidak mungkin ditebak, jadi hanya penerima link yang bisa mengisi form.
  const token = randomBytes(16).toString("base64url");
  await db.insert(testimonialInvites).values({
    id: token,
    clientName: parsed.data.clientName,
    eventType: parsed.data.eventType,
    expiresAt: new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000),
  });

  revalidatePath("/admin/testimoni");
  return {
    status: "success",
    message: `Link untuk ${parsed.data.clientName} siap dikirim (berlaku ${INVITE_DAYS} hari, sekali pakai).`,
    link: `${site.url}/testimoni/${token}`,
    clientName: parsed.data.clientName,
  };
}

export async function deleteInvite(formData: FormData): Promise<void> {
  await requireAdmin();
  const db = getDb();
  if (!db) return;
  await db.delete(testimonialInvites).where(eq(testimonialInvites.id, String(formData.get("id") ?? "")));
  revalidatePath("/admin/testimoni");
}

const moderateSchema = z.object({
  id: z.string().min(1),
  intent: z.enum(["approve", "hide", "delete"]),
  clientName: z.string().trim().min(1).max(60).optional(),
  quote: z.string().trim().min(1).max(500).optional(),
});

// approve = tampilkan (boleh sekalian perbaiki typo nama/ulasan)
// hide    = sembunyikan lagi dari website (kembali ke "menunggu")
// delete  = tolak/hapus permanen, termasuk fotonya
export async function moderateTestimonial(formData: FormData): Promise<void> {
  await requireAdmin();
  const db = getDb();
  if (!db) return;

  const parsed = moderateSchema.safeParse({
    id: formData.get("id"),
    intent: formData.get("intent"),
    clientName: formData.get("clientName") ?? undefined,
    quote: formData.get("quote") ?? undefined,
  });
  if (!parsed.success) return;
  const { id, intent, clientName, quote } = parsed.data;

  if (intent === "approve") {
    await db
      .update(testimonials)
      .set({ status: "approved", approvedAt: sql`now()`, ...(clientName ? { clientName } : {}), ...(quote ? { quote } : {}) })
      .where(eq(testimonials.id, id));
  } else if (intent === "hide") {
    await db.update(testimonials).set({ status: "pending", approvedAt: null }).where(eq(testimonials.id, id));
  } else {
    const [row] = await db.delete(testimonials).where(eq(testimonials.id, id)).returning();
    const storage = createSupabaseAdminClient();
    if (row?.photoPath && storage) await storage.storage.from("testimonials").remove([row.photoPath]);
  }

  revalidatePath("/");
  revalidatePath("/admin/testimoni");
}
