"use server";

import { and, asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/app/admin/actions";
import { getDb } from "@/db";
import { addOns, serviceGroups, serviceItems } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { slugify, uniqueId } from "@/lib/slug";

// Hasil aksi kecil (tambah/hapus/urutkan) yang dipanggil langsung dari tombol.
export type ActionResult = { ok: boolean; message: string };

const MAX_PRICE = 100_000_000;
const price = z.number().int().min(0, "Tidak boleh minus.").max(MAX_PRICE, "Terlalu besar.");
const groupName = z.string().trim().min(2, "Nama grup minimal 2 huruf.").max(40, "Maksimal 40 karakter.");
const itemName = z.string().trim().min(2, "Nama layanan minimal 2 huruf.").max(60, "Maksimal 60 karakter.");
const tier = z.enum(["reguler", "premium"]);

// "150.000" / "Rp150.000" / "150000" -> 150000. Kosong -> null.
function parsePrice(value: FormDataEntryValue | null): number | null {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits === "" ? null : Number(digits);
}

function revalidateServices() {
  for (const path of ["/", "/layanan", "/tentang", "/faq", "/admin", "/admin/layanan"]) revalidatePath(path);
}

// ---------- Simpan semua teks & harga (tombol Simpan) ----------

export async function saveServices(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const db = getDb();
  if (!db) return { status: "error", message: "Database belum disambungkan (DATABASE_URL kosong)." };

  const fieldErrors: Record<string, string> = {};
  const groups = new Map<string, { name: string; tier: "reguler" | "premium"; includes: string[] }>();
  const items = new Map<string, { name: string; price: number }>();
  const extras = new Map<string, { name: string; note: string | null; from: number; to: number | null }>();
  const get = (key: string) => formData.get(key);

  const ids = (kind: string) =>
    new Set([...formData.keys()].filter((k) => k.startsWith(`${kind}:`)).map((k) => k.split(":")[1]));

  for (const id of ids("group")) {
    const name = groupName.safeParse(get(`group:${id}:name`) ?? "");
    const t = tier.safeParse(get(`group:${id}:tier`));
    const includes = String(get(`group:${id}:includes`) ?? "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!name.success) fieldErrors[`group:${id}:name`] = name.error.issues[0].message;
    if (includes.length > 10 || includes.some((l) => l.length > 50)) {
      fieldErrors[`group:${id}:includes`] = "Maksimal 10 baris, masing-masing 50 karakter.";
    }
    if (name.success && t.success && !fieldErrors[`group:${id}:includes`]) {
      groups.set(id, { name: name.data, tier: t.data, includes });
    }
  }

  for (const id of ids("item")) {
    const name = itemName.safeParse(get(`item:${id}:name`) ?? "");
    const p = parsePrice(get(`item:${id}:price`));
    if (!name.success) fieldErrors[`item:${id}:name`] = name.error.issues[0].message;
    if (p === null) fieldErrors[`item:${id}:price`] = "Harga wajib diisi.";
    else if (!price.safeParse(p).success) fieldErrors[`item:${id}:price`] = "Harga tidak valid.";
    if (name.success && p !== null && !fieldErrors[`item:${id}:price`]) items.set(id, { name: name.data, price: p });
  }

  for (const id of ids("addon")) {
    const name = itemName.safeParse(get(`addon:${id}:name`) ?? "");
    const note = String(get(`addon:${id}:note`) ?? "").trim();
    const from = parsePrice(get(`addon:${id}:from`));
    const to = parsePrice(get(`addon:${id}:to`));
    if (!name.success) fieldErrors[`addon:${id}:name`] = name.error.issues[0].message;
    if (note.length > 80) fieldErrors[`addon:${id}:note`] = "Maksimal 80 karakter.";
    if (from === null) fieldErrors[`addon:${id}:from`] = "Harga wajib diisi.";
    else if (!price.safeParse(from).success) fieldErrors[`addon:${id}:from`] = "Harga tidak valid.";
    if (to !== null && (!price.safeParse(to).success || (from !== null && to <= from))) {
      fieldErrors[`addon:${id}:to`] = "Harus lebih besar dari harga awal.";
    }
    if (name.success && from !== null && !fieldErrors[`addon:${id}:from`] && !fieldErrors[`addon:${id}:to`] && note.length <= 80) {
      extras.set(id, { name: name.data, note: note || null, from, to });
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Ada isian yang perlu diperbaiki (ditandai merah).", fieldErrors };
  }

  // Tulis hanya baris yang berubah.
  const [curGroups, curItems, curExtras] = await Promise.all([
    db.select().from(serviceGroups),
    db.select().from(serviceItems),
    db.select().from(addOns),
  ]);
  const changedGroups = curGroups.filter((g) => {
    const n = groups.get(g.id);
    return n && (n.name !== g.name || n.tier !== g.tier || n.includes.join("\n") !== g.includes.join("\n"));
  });
  const changedItems = curItems.filter((i) => {
    const n = items.get(i.id);
    return n && (n.name !== i.name || n.price !== i.price);
  });
  const changedExtras = curExtras.filter((a) => {
    const n = extras.get(a.id);
    return n && (n.name !== a.name || n.note !== a.note || n.from !== a.priceFrom || n.to !== a.priceTo);
  });

  const changed = changedGroups.length + changedItems.length + changedExtras.length;
  if (changed === 0) return { status: "success", message: "Tidak ada yang berubah." };

  await db.transaction(async (tx) => {
    for (const g of changedGroups) {
      const n = groups.get(g.id)!;
      await tx.update(serviceGroups).set({ name: n.name, tier: n.tier, includes: n.includes }).where(eq(serviceGroups.id, g.id));
    }
    for (const i of changedItems) {
      const n = items.get(i.id)!;
      await tx
        .update(serviceItems)
        .set({ name: n.name, price: n.price, updatedAt: sql`now()` })
        .where(eq(serviceItems.id, i.id));
    }
    for (const a of changedExtras) {
      const n = extras.get(a.id)!;
      await tx
        .update(addOns)
        .set({ name: n.name, note: n.note, priceFrom: n.from, priceTo: n.to, updatedAt: sql`now()` })
        .where(eq(addOns.id, a.id));
    }
  });

  revalidateServices();
  return { status: "success", message: `${changed} perubahan tersimpan. Website sudah diperbarui.` };
}

// ---------- Aksi struktural (langsung tersimpan saat tombol ditekan) ----------

async function guard() {
  await requireAdmin();
  const db = getDb();
  if (!db) throw new Error("Database belum disambungkan.");
  return db;
}

export async function addGroup(name: string, groupTier: string): Promise<ActionResult> {
  const db = await guard();
  const n = groupName.safeParse(name);
  const t = tier.safeParse(groupTier);
  if (!n.success) return { ok: false, message: n.error.issues[0].message };
  if (!t.success) return { ok: false, message: "Pilih Reguler atau Premium." };

  const existing = await db.select({ id: serviceGroups.id, sortOrder: serviceGroups.sortOrder }).from(serviceGroups);
  const id = uniqueId(slugify(n.data), existing.map((g) => g.id));
  const sortOrder = Math.max(0, ...existing.map((g) => g.sortOrder)) + 1;
  await db.insert(serviceGroups).values({ id, name: n.data, tier: t.data, includes: [], sortOrder });
  revalidateServices();
  return { ok: true, message: `Grup "${n.data}" ditambahkan.` };
}

// Menghapus grup ikut menghapus semua layanan di dalamnya (foreign key ON DELETE CASCADE).
export async function deleteGroup(id: string): Promise<ActionResult> {
  const db = await guard();
  await db.delete(serviceGroups).where(eq(serviceGroups.id, id));
  revalidateServices();
  return { ok: true, message: "Grup dihapus." };
}

export async function addItem(groupId: string, name: string, rawPrice: string): Promise<ActionResult> {
  const db = await guard();
  const n = itemName.safeParse(name);
  const p = parsePrice(rawPrice);
  if (!n.success) return { ok: false, message: n.error.issues[0].message };
  if (p === null || !price.safeParse(p).success) return { ok: false, message: "Isi harga yang valid." };

  const [group] = await db.select({ id: serviceGroups.id }).from(serviceGroups).where(eq(serviceGroups.id, groupId));
  if (!group) return { ok: false, message: "Grup tidak ditemukan." };

  const all = await db.select({ id: serviceItems.id, groupId: serviceItems.groupId, sortOrder: serviceItems.sortOrder }).from(serviceItems);
  const id = uniqueId(slugify(n.data), all.map((i) => i.id));
  const sortOrder = Math.max(0, ...all.filter((i) => i.groupId === groupId).map((i) => i.sortOrder)) + 1;
  await db.insert(serviceItems).values({ id, groupId, name: n.data, price: p, sortOrder });
  revalidateServices();
  return { ok: true, message: `"${n.data}" ditambahkan.` };
}

export async function deleteItem(id: string): Promise<ActionResult> {
  const db = await guard();
  await db.delete(serviceItems).where(eq(serviceItems.id, id));
  revalidateServices();
  return { ok: true, message: "Layanan dihapus." };
}

export async function addExtra(name: string, rawPrice: string): Promise<ActionResult> {
  const db = await guard();
  const n = itemName.safeParse(name);
  const p = parsePrice(rawPrice);
  if (!n.success) return { ok: false, message: n.error.issues[0].message };
  if (p === null || !price.safeParse(p).success) return { ok: false, message: "Isi harga yang valid." };

  const all = await db.select({ id: addOns.id, sortOrder: addOns.sortOrder }).from(addOns);
  const id = uniqueId(slugify(n.data), all.map((a) => a.id));
  const sortOrder = Math.max(0, ...all.map((a) => a.sortOrder)) + 1;
  await db.insert(addOns).values({ id, name: n.data, priceFrom: p, sortOrder });
  revalidateServices();
  return { ok: true, message: `"${n.data}" ditambahkan.` };
}

export async function deleteExtra(id: string): Promise<ActionResult> {
  const db = await guard();
  await db.delete(addOns).where(eq(addOns.id, id));
  revalidateServices();
  return { ok: true, message: "Layanan tambahan dihapus." };
}

// Tukar urutan dengan tetangga di atas/bawah. Untuk layanan, hanya di dalam grup yang sama.
export async function move(kind: "group" | "item" | "addon", id: string, direction: "up" | "down"): Promise<ActionResult> {
  const db = await guard();
  const step = direction === "up" ? -1 : 1;

  // Nomor urut dirapikan jadi 1..n dulu (data lama bisa punya nomor kembar), lalu ditukar.
  const swap = async (list: { id: string; sortOrder: number }[], update: (id: string, sortOrder: number) => Promise<unknown>) => {
    const index = list.findIndex((r) => r.id === id);
    if (index < 0 || !list[index + step]) return;
    const order = list.map((r) => r.id);
    [order[index], order[index + step]] = [order[index + step], order[index]];
    for (const [i, rowId] of order.entries()) {
      if (list.find((r) => r.id === rowId)!.sortOrder !== i + 1) await update(rowId, i + 1);
    }
  };

  await db.transaction(async (tx) => {
    if (kind === "group") {
      const list = await tx.select({ id: serviceGroups.id, sortOrder: serviceGroups.sortOrder }).from(serviceGroups).orderBy(asc(serviceGroups.sortOrder));
      await swap(list, (rid, so) => tx.update(serviceGroups).set({ sortOrder: so }).where(eq(serviceGroups.id, rid)));
    } else if (kind === "item") {
      const [row] = await tx.select({ groupId: serviceItems.groupId }).from(serviceItems).where(eq(serviceItems.id, id));
      if (!row) return;
      const list = await tx
        .select({ id: serviceItems.id, sortOrder: serviceItems.sortOrder })
        .from(serviceItems)
        .where(and(eq(serviceItems.groupId, row.groupId)))
        .orderBy(asc(serviceItems.sortOrder));
      await swap(list, (rid, so) => tx.update(serviceItems).set({ sortOrder: so }).where(eq(serviceItems.id, rid)));
    } else {
      const list = await tx.select({ id: addOns.id, sortOrder: addOns.sortOrder }).from(addOns).orderBy(asc(addOns.sortOrder));
      await swap(list, (rid, so) => tx.update(addOns).set({ sortOrder: so }).where(eq(addOns.id, rid)));
    }
  });

  revalidateServices();
  return { ok: true, message: "" };
}
