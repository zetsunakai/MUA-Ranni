import { boolean, date, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

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

// Kategori acara (Bridal, Wisuda, ...). Dipakai portofolio DAN "jenis acara" testimoni.
// id = slug yang tidak pernah berubah; label boleh diganti admin.
export const categoryTable = pgTable("categories", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").notNull(),
}).enableRLS();

// Portofolio. Foto disimpan di Supabase Storage (bucket "portfolio");
// kolom *_url = URL publik untuk ditampilkan, *_path = lokasi file di bucket
// (untuk menghapus file lama). *_path kosong untuk foto dari luar (dummy Unsplash).
export const portfolioItems = pgTable("portfolio_items", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category")
    .notNull()
    .references(() => categoryTable.id, { onDelete: "restrict", onUpdate: "cascade" }),
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
  eventType: text("event_type").references(() => categoryTable.id, { onDelete: "set null", onUpdate: "cascade" }),
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
  eventType: text("event_type")
    .notNull()
    .references(() => categoryTable.id, { onDelete: "restrict", onUpdate: "cascade" }),
  quote: text("quote").notNull(),
  photoUrl: text("photo_url"),
  photoPath: text("photo_path"),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
}).enableRLS();

// Kalender ketersediaan. Tanggal yang TIDAK ada di tabel ini = tersedia.
// "limited" = masih bisa tapi slot terbatas, "full" = penuh.
// note = catatan pribadi admin (nama klien, lokasi); tidak pernah dikirim ke halaman publik.
// mode "string": tanggal disimpan/dibaca sebagai "YYYY-MM-DD" apa adanya, tanpa konversi zona waktu.
export const scheduleDays = pgTable("schedule_days", {
  date: date("date", { mode: "string" }).primaryKey(),
  status: text("status", { enum: ["limited", "full"] }).notNull(),
  note: text("note"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

// Profil yang bisa diubah admin (satu baris saja, id = 1). Kolom kosong = pakai nilai
// bawaan di src/data/site.ts & about.ts, jadi website tetap lengkap sebelum diisi.
export const siteProfile = pgTable("site_profile", {
  id: integer("id").primaryKey().default(1),
  whatsappNumber: text("whatsapp_number"),
  instagramHandle: text("instagram_handle"),
  tiktokHandle: text("tiktok_handle"),
  serviceAreas: text("service_areas").array(),
  responseHours: text("response_hours"),
  greeting: text("greeting"),
  bio: text("bio").array(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();
