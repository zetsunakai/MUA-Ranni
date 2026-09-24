import { site } from "@/data/site";

export const DEFAULT_WHATSAPP_MESSAGE = "Halo Kak, saya mau tanya jadwal dan paket makeup.";

// Setiap tombol WhatsApp punya "source" sendiri. Klik tombol membuka /chat/<source>
// dulu, yang tercatat sebagai kunjungan di Vercel Analytics, lalu langsung diarahkan
// ke WhatsApp. Jumlah kunjungan /chat/hero = jumlah klik tombol WA di hero, dst.
// (Custom event Vercel hanya ada di paket Pro, jadi pakai cara ini di paket Hobby.)
export const WHATSAPP_SOURCES = [
  "navbar",
  "floating",
  "hero",
  "home-cta",
  "layanan",
  "layanan-cta",
  "lightbox",
  "tentang",
  "kontak",
  "footer",
] as const;

export type WhatsAppSource = (typeof WHATSAPP_SOURCES)[number];

// Link untuk tombol di website: lewat halaman perantara supaya kliknya terhitung.
export function whatsappUrl(source: WhatsAppSource, message: string = DEFAULT_WHATSAPP_MESSAGE): string {
  return `/chat/${source}?text=${encodeURIComponent(message)}`;
}

// Link wa.me asli, dipakai halaman /chat untuk redirect.
export function directWhatsappUrl(message: string = DEFAULT_WHATSAPP_MESSAGE): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
