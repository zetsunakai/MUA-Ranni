"use server";

import { randomUUID } from "node:crypto";
import { and, eq, inArray, isNull, like, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { FormState } from "@/app/admin/actions";
import { getDb } from "@/db";
import { BOOKING_STATUSES, PAYMENT_KINDS, PAYMENT_METHODS, bookingLines, bookings, payments, serviceItems } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { todayInJakarta } from "@/lib/dates";
import { isGoogleMapsUrl } from "@/lib/maps";

const MAX_RUPIAH = 1_000_000_000;
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid.");
const rupiah = (label: string) =>
  z.coerce.number({ error: `${label} harus angka.` }).int(`${label} harus bilangan bulat.`).min(0, `${label} tidak boleh minus.`).max(MAX_RUPIAH, `${label} terlalu besar.`);
const optionalText = (max: number) => z.string().trim().max(max, `Maksimal ${max} karakter.`).transform((v) => v || null);

const lineSchema = z.object({
  serviceItemId: z.string().min(1).nullable(),
  description: z.string().trim().min(1, "Deskripsi layanan wajib diisi.").max(120, "Deskripsi maksimal 120 karakter."),
  qty: z.coerce.number().int("Jumlah harus bilangan bulat.").min(1, "Jumlah minimal 1.").max(50, "Jumlah maksimal 50."),
  unitPrice: rupiah("Harga"),
});

const bookingSchema = z.object({
  clientName: z.string().trim().min(1, "Nama klien wajib diisi.").max(80, "Maksimal 80 karakter."),
  clientPhone: optionalText(30),
  eventType: optionalText(60),
  eventDate: isoDate,
  makeupTime: optionalText(20),
  location: optionalText(300),
  mapsUrl: optionalText(500).refine((v) => !v || isGoogleMapsUrl(v), "Gunakan link dari Google Maps."),
  people: z.string().trim().transform((v, ctx) => {
    if (!v) return null;
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1 || n > 100) {
      ctx.addIssue({ code: "custom", message: "Jumlah orang 1–100." });
      return z.NEVER;
    }
    return n;
  }),
  hairdo: optionalText(60),
  note: optionalText(1000),
  transportFee: rupiah("Biaya transport"),
  discount: rupiah("Diskon"),
  lines: z.array(lineSchema).min(1, "Tambahkan minimal 1 layanan.").max(30, "Maksimal 30 baris layanan."),
});

function parseLines(value: FormDataEntryValue | null): unknown {
  try {
    return JSON.parse(String(value ?? "[]"));
  } catch {
    return [];
  }
}

// Nomor urut per bulan dibuat: BK-2611-001, BK-2611-002, ...
async function nextCode(db: NonNullable<ReturnType<typeof getDb>>): Promise<string> {
  const today = todayInJakarta();
  const prefix = `BK-${today.slice(2, 4)}${today.slice(5, 7)}-`;
  const [row] = await db
    .select({ last: sql<string | null>`max(${bookings.code})` })
    .from(bookings)
    .where(like(bookings.code, `${prefix}%`));
  const lastNumber = row?.last ? Number(row.last.slice(prefix.length)) : 0;
  return `${prefix}${String(lastNumber + 1).padStart(3, "0")}`;
}

export async function saveBooking(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const db = getDb();
  if (!db) return { status: "error", message: "Database belum disambungkan." };

  const parsed = bookingSchema.safeParse({
    clientName: formData.get("clientName") ?? "",
    clientPhone: formData.get("clientPhone") ?? "",
    eventType: formData.get("eventType") ?? "",
    eventDate: formData.get("eventDate") ?? "",
    makeupTime: formData.get("makeupTime") ?? "",
    location: formData.get("location") ?? "",
    mapsUrl: formData.get("mapsUrl") ?? "",
    people: formData.get("people") ?? "",
    hairdo: formData.get("hairdo") ?? "",
    note: formData.get("note") ?? "",
    transportFee: formData.get("transportFee") || 0,
    discount: formData.get("discount") || 0,
    lines: parseLines(formData.get("lines")),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] === "lines" ? "lines" : String(issue.path[0]);
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: parsed.error.issues[0].message, fieldErrors };
  }

  const { lines, ...fields } = parsed.data;
  // serviceItemId dari browser hanya dipakai kalau layanannya memang ada.
  const referencedIds = [...new Set(lines.map((l) => l.serviceItemId).filter((v): v is string => Boolean(v)))];
  const existingIds = new Set(
    referencedIds.length
      ? (await db.select({ id: serviceItems.id }).from(serviceItems).where(inArray(serviceItems.id, referencedIds))).map((r) => r.id)
      : [],
  );
  const lineRows = (bookingId: string) =>
    lines.map((line, index) => ({
      id: randomUUID(),
      bookingId,
      serviceItemId: line.serviceItemId && existingIds.has(line.serviceItemId) ? line.serviceItemId : null,
      description: line.description,
      qty: line.qty,
      unitPrice: line.unitPrice,
      sortOrder: index,
    }));

  const existingId = String(formData.get("id") ?? "");
  let id = existingId;

  if (existingId) {
    const updated = await db.transaction(async (tx) => {
      const rows = await tx
        .update(bookings)
        .set({ ...fields, updatedAt: sql`now()` })
        .where(eq(bookings.id, existingId))
        .returning({ id: bookings.id });
      if (rows.length === 0) return false;
      await tx.delete(bookingLines).where(eq(bookingLines.bookingId, existingId));
      await tx.insert(bookingLines).values(lineRows(existingId));
      return true;
    });
    if (!updated) return { status: "error", message: "Booking tidak ditemukan." };
  } else {
    id = randomUUID();
    // Dua kali percobaan kalau nomor urut bentrok (misalnya disimpan bersamaan dari dua perangkat).
    for (let attempt = 0; ; attempt++) {
      try {
        await db.transaction(async (tx) => {
          await tx.insert(bookings).values({ id, code: await nextCode(db), ...fields });
          await tx.insert(bookingLines).values(lineRows(id));
        });
        break;
      } catch (error) {
        const code = (error as { cause?: { code?: string }; code?: string }).cause?.code ?? (error as { code?: string }).code;
        if (code !== "23505" || attempt >= 1) throw error;
      }
    }
  }

  revalidatePath("/admin/booking");
  revalidatePath(`/admin/booking/${id}`);
  if (!existingId) redirect(`/admin/booking/${id}`);
  return { status: "success", message: "Booking tersimpan." };
}

const statusSchema = z.object({ id: z.string().min(1), status: z.enum(BOOKING_STATUSES) });

export async function setBookingStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const db = getDb();
  if (!db) return;
  const parsed = statusSchema.safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) return;
  await db.update(bookings).set({ status: parsed.data.status, updatedAt: sql`now()` }).where(eq(bookings.id, parsed.data.id));
  revalidatePath("/admin/booking");
  revalidatePath(`/admin/booking/${parsed.data.id}`);
}

export async function deleteBooking(formData: FormData): Promise<void> {
  await requireAdmin();
  const db = getDb();
  if (!db) return;
  const id = String(formData.get("id") ?? "");
  if (id) await db.delete(bookings).where(eq(bookings.id, id));
  revalidatePath("/admin/booking");
  redirect("/admin/booking");
}

const paymentSchema = z.object({
  bookingId: z.string().min(1),
  paidOn: isoDate,
  amount: rupiah("Nominal").min(1, "Nominal wajib diisi."),
  kind: z.enum(PAYMENT_KINDS, "Pilih jenis pembayaran."),
  method: z.enum(PAYMENT_METHODS, "Pilih metode pembayaran."),
  note: optionalText(200),
});

export async function addPayment(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const db = getDb();
  if (!db) return { status: "error", message: "Database belum disambungkan." };

  const parsed = paymentSchema.safeParse({
    bookingId: formData.get("bookingId"),
    paidOn: formData.get("paidOn") ?? "",
    amount: formData.get("amount") ?? "",
    kind: formData.get("kind"),
    method: formData.get("method"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };

  const [booking] = await db.select({ id: bookings.id }).from(bookings).where(eq(bookings.id, parsed.data.bookingId));
  if (!booking) return { status: "error", message: "Booking tidak ditemukan." };

  await db.insert(payments).values({ id: randomUUID(), ...parsed.data });
  revalidatePath("/admin/booking");
  revalidatePath(`/admin/booking/${parsed.data.bookingId}`);
  return { status: "success", message: "Pembayaran tercatat." };
}

export async function deletePayment(formData: FormData): Promise<void> {
  await requireAdmin();
  const db = getDb();
  if (!db) return;
  const id = String(formData.get("id") ?? "");
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!id || !bookingId) return;
  await db.delete(payments).where(and(eq(payments.id, id), eq(payments.bookingId, bookingId)));
  revalidatePath("/admin/booking");
  revalidatePath(`/admin/booking/${bookingId}`);
}

// Beri nomor invoice (sekali saja). Booking harus sudah confirmed/selesai.
export async function issueInvoice(formData: FormData): Promise<void> {
  await requireAdmin();
  const db = getDb();
  if (!db) return;
  const id = String(formData.get("id") ?? "");
  const [booking] = await db.select({ status: bookings.status, invoiceNumber: bookings.invoiceNumber }).from(bookings).where(eq(bookings.id, id));
  if (!booking || booking.invoiceNumber || (booking.status !== "confirmed" && booking.status !== "selesai")) return;

  const today = todayInJakarta();
  const prefix = `INV-${today.slice(2, 4)}${today.slice(5, 7)}-`;
  for (let attempt = 0; ; attempt++) {
    const [row] = await db
      .select({ last: sql<string | null>`max(${bookings.invoiceNumber})` })
      .from(bookings)
      .where(like(bookings.invoiceNumber, `${prefix}%`));
    const next = `${prefix}${String((row?.last ? Number(row.last.slice(prefix.length)) : 0) + 1).padStart(3, "0")}`;
    try {
      await db
        .update(bookings)
        .set({ invoiceNumber: next, invoiceIssuedAt: today, updatedAt: sql`now()` })
        .where(and(eq(bookings.id, id), isNull(bookings.invoiceNumber)));
      break;
    } catch (error) {
      const code = (error as { cause?: { code?: string }; code?: string }).cause?.code ?? (error as { code?: string }).code;
      if (code !== "23505" || attempt >= 2) throw error;
    }
  }
  revalidatePath(`/admin/booking/${id}`);
}
