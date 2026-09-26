import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

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

// Portofolio. Foto disimpan di Supabase Storage (bucket "portfolio");
// kolom *_url = URL publik untuk ditampilkan, *_path = lokasi file di bucket
// (untuk menghapus file lama). *_path kosong untuk foto dari luar (dummy Unsplash).
export const portfolioItems = pgTable("portfolio_items", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category", { enum: ["bridal", "wisuda", "engagement", "photoshoot"] }).notNull(),
  imageUrl: text("image_url").notNull(),
  imagePath: text("image_path"),
  beforeImageUrl: text("before_image_url"),
  beforeImagePath: text("before_image_path"),
  description: text("description"),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

// Testimoni diisi klien sendiri lewat link undangan sekali pakai.
// Alur: admin buat undangan -> klien isi form -> status "pending" -> admin setujui -> tampil di Home.
export const testimonialInvites = pgTable("testimonial_invites", {
  id: text("id").primaryKey(), // token acak 128-bit di URL /testimoni/<id>
  clientName: text("client_name").notNull(),
  eventType: text("event_type", { enum: ["bridal", "wisuda", "engagement", "photoshoot"] }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
}).enableRLS();

export const testimonials = pgTable("testimonials", {
  id: text("id").primaryKey(),
  inviteId: text("invite_id")
    .unique()
    .references(() => testimonialInvites.id, { onDelete: "set null" }),
  clientName: text("client_name").notNull(),
  eventType: text("event_type", { enum: ["bridal", "wisuda", "engagement", "photoshoot"] }).notNull(),
  quote: text("quote").notNull(),
  photoUrl: text("photo_url"),
  photoPath: text("photo_path"),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
}).enableRLS();
