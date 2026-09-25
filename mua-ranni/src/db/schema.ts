import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Tabel harga, mengikuti tipe ServiceGroup / ServiceItem / AddOn di src/types.
// Padanan di Odoo: setiap pgTable = satu models.Model, setiap kolom = satu fields.*.
//
// .enableRLS(): Row Level Security aktif tanpa policy apa pun. Artinya tabel ini
// TIDAK bisa dibaca/ditulis lewat Supabase Data API memakai publishable key yang
// terlihat di browser. Website mengaksesnya lewat koneksi database langsung
// (DATABASE_URL) dari server, yang tidak terkena RLS.

export const serviceGroups = pgTable("service_groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  tier: text("tier", { enum: ["reguler", "premium"] }).notNull(),
  includes: text("includes").array().notNull(),
  sortOrder: integer("sort_order").notNull(),
}).enableRLS();

export const serviceItems = pgTable("service_items", {
  id: text("id").primaryKey(),
  groupId: text("group_id")
    .notNull()
    .references(() => serviceGroups.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  sortOrder: integer("sort_order").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export const addOns = pgTable("add_ons", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  priceFrom: integer("price_from").notNull(),
  priceTo: integer("price_to"),
  note: text("note"),
  sortOrder: integer("sort_order").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();
