// Struktur data mengikuti PRD, dipakai sama dari Tahap 2 sampai 4
// supaya migrasi ke Supabase nanti tinggal pindah sumber data.

export type Category = "bridal" | "wisuda" | "engagement" | "photoshoot";

export type PortfolioItem = {
  id: string;
  title: string;
  category: Category;
  imageUrl: string;
  beforeImageUrl?: string;
  description?: string;
  featured: boolean;
  createdAt: string; // ISO date, contoh "2026-08-17"
};

export type Package = {
  id: string;
  name: string;
  price: number; // rupiah
  includes: string[];
  durationHours: number;
  notes?: string;
  order: number;
};

export type Testimonial = {
  id: string;
  clientName: string;
  eventType: Category;
  quote: string;
  photoUrl?: string;
};

export type NavLink = {
  href: string;
  label: string;
};
