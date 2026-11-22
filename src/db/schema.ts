import { sql } from "drizzle-orm";
import { boolean, date, index, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

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
  // Id kategori jenis acara (tabel categories) yang cocok untuk layanan ini, boleh lebih dari satu.
  // Dipakai untuk menyaring pilihan layanan di form booking admin sesuai jenis acara.
  categories: text("categories").array().notNull().default(sql`'{}'::text[]`),
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
  // Urutan tampil (kecil = di depan), diatur admin di /admin/portofolio/urutan.
  // Foto baru diberi nilai terkecil supaya muncul paling depan.
  sortOrder: integer("sort_order").notNull().default(0),
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
  // Aturan booking (tampil di Layanan, Kontak, Jadwal, FAQ).
  depositInfo: text("deposit_info"),
  paymentInfo: text("payment_info"),
  terms: text("terms").array(),
  // Foto profil di Home & Tentang (bucket "portfolio", folder profile/).
  photoUrl: text("photo_url"),
  photoPath: text("photo_path"),
  // Lokasi base untuk footer & halaman Kontak.
  locationName: text("location_name"),
  locationAddress: text("location_address"),
  locationMapsUrl: text("location_maps_url"),
  // Rekening untuk pesan booking WhatsApp & invoice.
  bankAccounts: jsonb("bank_accounts").$type<{ bank: string; number: string }[]>(),
  bankAccountName: text("bank_account_name"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

// FAQ yang diketik admin. Tabel kosong = FAQ bawaan yang dirangkai otomatis (src/lib/faqs.ts).
export const faqs = pgTable("faqs", {
  id: text("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull(),
}).enableRLS();

// Logo brand produk. logo_path kosong = file bawaan di public/images/brands;
// selain itu file upload di bucket "portfolio" folder brands/.
export const brands = pgTable("brands", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url").notNull(),
  logoPath: text("logo_path"),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  sortOrder: integer("sort_order").notNull(),
}).enableRLS();

// ---------- Booking (catatan order & pemasukan, khusus admin) ----------
// Padanan Odoo: bookings = sale.order, booking_lines = sale.order.line, payments = account.payment.
// Data klien disimpan langsung di booking (tanpa tabel klien terpisah).
// Estimasi dan booking adalah baris yang sama: status "estimasi" lalu di-confirm.
// Semua nominal dalam rupiah (integer, tanpa desimal).
export const BOOKING_STATUSES = ["estimasi", "confirmed", "selesai", "batal"] as const;

export const bookings = pgTable("bookings", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(), // contoh BK-2611-001 (tahun-bulan dibuat + nomor urut)
  clientName: text("client_name").notNull(),
  clientPhone: text("client_phone"),
  eventType: text("event_type"),
  eventDate: date("event_date", { mode: "string" }).notNull(),
  makeupTime: text("makeup_time"),
  location: text("location"),
  mapsUrl: text("maps_url"),
  people: integer("people"),
  hairdo: text("hairdo"),
  note: text("note"),
  status: text("status", { enum: BOOKING_STATUSES }).notNull().default("estimasi"),
  transportFee: integer("transport_fee").notNull().default(0),
  discount: integer("discount").notNull().default(0),
  // Diisi saat admin pertama kali membuat invoice (INV-2611-001). Kosong = belum pernah dibuat.
  invoiceNumber: text("invoice_number").unique(),
  invoiceIssuedAt: date("invoice_issued_at", { mode: "string" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("bookings_event_date_idx").on(t.eventDate)]).enableRLS();

// Harga disalin saat booking dibuat (unit_price), jadi perubahan price list
// tidak mengubah booking lama. service_item_id hanya penanda asal baris.
export const bookingLines = pgTable("booking_lines", {
  id: text("id").primaryKey(),
  bookingId: text("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  serviceItemId: text("service_item_id").references(() => serviceItems.id, { onDelete: "set null" }),
  description: text("description").notNull(),
  qty: integer("qty").notNull().default(1),
  unitPrice: integer("unit_price").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
}, (t) => [index("booking_lines_booking_idx").on(t.bookingId)]).enableRLS();

export const PAYMENT_KINDS = ["dp", "pelunasan", "lainnya"] as const;
export const PAYMENT_METHODS = ["bca", "seabank", "cash", "lainnya"] as const;

// Uang yang benar-benar masuk. Inilah angka "pemasukan" di laporan.
export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  bookingId: text("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  paidOn: date("paid_on", { mode: "string" }).notNull(),
  amount: integer("amount").notNull(),
  kind: text("kind", { enum: PAYMENT_KINDS }).notNull(),
  method: text("method", { enum: PAYMENT_METHODS }).notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("payments_booking_idx").on(t.bookingId), index("payments_paid_on_idx").on(t.paidOn)]).enableRLS();

// ---------- Belanja / pengeluaran (khusus admin) ----------
export const EXPENSE_CATEGORIES = ["bahan", "alat", "lainnya"] as const;

export const expenses = pgTable("expenses", {
  id: text("id").primaryKey(),
  spentOn: date("spent_on", { mode: "string" }).notNull(),
  category: text("category", { enum: EXPENSE_CATEGORIES }).notNull(),
  item: text("item").notNull(),
  store: text("store"),
  amount: integer("amount").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("expenses_spent_on_idx").on(t.spentOn)]).enableRLS();
