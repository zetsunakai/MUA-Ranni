// Struktur data mengikuti PRD, dipakai sama dari Tahap 2 sampai 4
// supaya migrasi ke Supabase nanti tinggal pindah sumber data.

// Kategori sekarang dikelola admin (tabel categories). Nilainya = id/slug kategori.
export type Category = string;

export type CategoryOption = {
  id: string;
  label: string;
};

export type PortfolioItem = {
  id: string;
  title: string;
  category: Category;
  categoryLabel: string;
  imageUrl: string;
  beforeImageUrl?: string;
  description?: string;
  featured: boolean;
  createdAt: string; // ISO date, contoh "2026-08-17"
};

// Harga mengikuti Price List 2026: per orang, dikelompokkan per grup.
// Setiap grup punya satu set bonus (includes) yang berlaku untuk semua item di dalamnya.
export type ServiceItem = {
  id: string;
  name: string;
  price: number; // rupiah per orang
};

export type ServiceGroup = {
  id: string;
  name: string;
  tier: "reguler" | "premium";
  includes: string[];
  items: ServiceItem[];
  order: number;
};

export type AddOn = {
  id: string;
  name: string;
  priceFrom: number;
  priceTo?: number; // diisi kalau harganya rentang
  note?: string;
};

export type Brand = {
  name: string;
  logo: string;
  width: number;
  height: number;
};

export type Testimonial = {
  id: string;
  clientName: string;
  eventType: Category;
  eventLabel: string;
  quote: string;
  photoUrl?: string;
};

export type NavLink = {
  href: string;
  label: string;
};
