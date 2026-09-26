import "server-only";

import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { cache } from "react";
import { testimonials as staticTestimonials, testimonialsArePlaceholder } from "@/data/testimonials";
import { getDb } from "@/db";
import { testimonialInvites, testimonials } from "@/db/schema";
import type { Category, Testimonial } from "@/types";

// VERCEL_ENV diisi otomatis oleh Vercel saat build: "production" untuk domain utama.
const isProduction = process.env.VERCEL_ENV === "production";

type TestimonialRow = typeof testimonials.$inferSelect;

function toTestimonial(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    clientName: row.clientName,
    eventType: row.eventType,
    quote: row.quote,
    photoUrl: row.photoUrl ?? undefined,
  };
}

// Testimoni untuk website publik: HANYA yang sudah disetujui admin, terbaru di atas.
// Tanpa database, pakai data dummy (dan tetap disembunyikan di production).
export const getPublicTestimonials = cache(async (): Promise<Testimonial[]> => {
  const db = getDb();
  if (!db) return testimonialsArePlaceholder && isProduction ? [] : staticTestimonials;
  const rows = await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.status, "approved"))
    .orderBy(desc(testimonials.approvedAt));
  return rows.map(toTestimonial);
});

export type InviteCheck =
  | { ok: true; invite: { id: string; clientName: string; eventType: Category | null } }
  | { ok: false; reason: "not-found" | "used" | "expired" };

// Cek link undangan /testimoni/<token>.
export async function checkInvite(token: string): Promise<InviteCheck> {
  const db = getDb();
  if (!db || !/^[A-Za-z0-9_-]{16,64}$/.test(token)) return { ok: false, reason: "not-found" };
  const [invite] = await db.select().from(testimonialInvites).where(eq(testimonialInvites.id, token));
  if (!invite) return { ok: false, reason: "not-found" };
  if (invite.usedAt) return { ok: false, reason: "used" };
  if (invite.expiresAt < new Date()) return { ok: false, reason: "expired" };
  return { ok: true, invite: { id: invite.id, clientName: invite.clientName, eventType: invite.eventType } };
}

// Data halaman admin: menunggu persetujuan, sudah tampil, dan undangan yang belum dipakai.
export async function getTestimonialAdminData() {
  const db = getDb();
  if (!db) return null;
  const [all, openInvites] = await Promise.all([
    db.select().from(testimonials).orderBy(desc(testimonials.createdAt)),
    db
      .select()
      .from(testimonialInvites)
      .where(and(isNull(testimonialInvites.usedAt), gt(testimonialInvites.expiresAt, new Date())))
      .orderBy(desc(testimonialInvites.createdAt)),
  ]);
  return {
    pending: all.filter((t) => t.status === "pending"),
    approved: all.filter((t) => t.status === "approved"),
    openInvites,
  };
}
