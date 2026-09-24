import type { Category, NavLink } from "@/types";

// Nama, WhatsApp, dan Instagram dari Price List 2026.
export const site = {
  url: "https://mua-ranni.vercel.app", // ganti kalau nanti pakai domain sendiri
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

export const navLinks: NavLink[] = [
  { href: "/portfolio", label: "Portofolio" },
  { href: "/layanan", label: "Layanan & Harga" },
  { href: "/tentang", label: "Tentang" },
  { href: "/kontak", label: "Kontak" },
];

export const categoryLabels: Record<Category, string> = {
  bridal: "Bridal",
  wisuda: "Wisuda",
  engagement: "Engagement",
  photoshoot: "Photoshoot",
};

// Urutan chip filter di halaman Portofolio.
export const categories = Object.keys(categoryLabels) as Category[];
