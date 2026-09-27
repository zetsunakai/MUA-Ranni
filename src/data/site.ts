import type { CategoryOption, NavLink } from "@/types";

// Nama, WhatsApp, dan Instagram dari Price List 2026.
export const site = {
  url: "https://mua-rannilstry.web.id", // domain utama; dipakai sitemap, OG image, link undangan testimoni
  name: "Ranni Tary Makeup",
  tagline: "Makeup artist wisuda, pesta, dan acara pernikahan",
  whatsappNumber: "6283136359324",
  whatsappDisplay: "0831-3635-9324",
  instagramHandle: "@rannitary_makeup",
  instagramUrl: "https://instagram.com/rannitary_makeup",
  tiktokUrl: "https://tiktok.com/@rannitary_makeup",
  serviceAreas: ["Depok", "Kota Bogor", "Bogor"],
  responseHours: "Setiap hari, 08.00–22.00 WIB",
};

// Menu utama sesuai desain. Kontak tidak di navbar (tombol WhatsApp sudah ada),
// tapi tetap ada di footer dan sitemap lewat extraLinks.
export const navLinks: NavLink[] = [
  { href: "/portfolio", label: "Portofolio" },
  { href: "/layanan", label: "Layanan & Harga" },
  { href: "/jadwal", label: "Jadwal" },
  { href: "/tentang", label: "Tentang" },
  { href: "/faq", label: "FAQ" },
];

export const extraLinks: NavLink[] = [{ href: "/kontak", label: "Kontak" }];

// Jenis acara di band gelap Home.
export const eventHighlights = ["Wisuda", "Pesta", "Akad", "Lamaran", "Prewedding", "Bridesmaid"];

// Kategori bawaan. Kategori sebenarnya dikelola admin di database (tabel categories);
// daftar ini hanya dipakai kalau database belum disambungkan.
export const defaultCategories: CategoryOption[] = [
  { id: "bridal", label: "Bridal" },
  { id: "wisuda", label: "Wisuda" },
  { id: "engagement", label: "Engagement" },
  { id: "photoshoot", label: "Photoshoot" },
];
