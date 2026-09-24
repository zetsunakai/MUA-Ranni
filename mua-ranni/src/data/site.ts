import type { Category, NavLink } from "@/types";

// DUMMY: ganti dengan data asli MUA sebelum launch.
export const site = {
  name: "Ranni Makeup",
  tagline: "Makeup artist bridal, wisuda, dan photoshoot",
  whatsappNumber: "6281234567890", // format internasional tanpa "+" atau spasi
  instagramUrl: "https://instagram.com/ranni.makeup",
  tiktokUrl: "https://tiktok.com/@ranni.makeup",
  serviceAreas: ["Depok", "Jakarta Selatan", "Bogor"],
  responseHours: "Setiap hari, 08.00–21.00 WIB",
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
