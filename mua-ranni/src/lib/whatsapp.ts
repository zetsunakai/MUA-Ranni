import { site } from "@/data/site";

export const DEFAULT_WHATSAPP_MESSAGE = "Halo Kak, saya mau tanya jadwal dan paket makeup.";

// Link wa.me dengan pesan otomatis, contoh:
// whatsappUrl("Halo Kak, saya tertarik paket Bridal Premium untuk tanggal ...")
export function whatsappUrl(message: string = DEFAULT_WHATSAPP_MESSAGE): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
