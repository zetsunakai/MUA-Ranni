
export const DEFAULT_WHATSAPP_MESSAGE = "Halo Kak, saya mau tanya jadwal dan paket makeup.";

// Setiap tombol WhatsApp punya "source" sendiri. Klik tombol membuka /chat/<source>
// dulu, yang tercatat sebagai kunjungan di Vercel Analytics, lalu langsung diarahkan
// ke WhatsApp. Jumlah kunjungan /chat/hero = jumlah klik tombol WA di hero, dst.
// (Custom event Vercel hanya ada di paket Pro, jadi pakai cara ini di paket Hobby.)
export const WHATSAPP_SOURCES = [
  "floating",
  "hero",
  "home-cta",
  "layanan",
  "lightbox",
  "jadwal",
  "kontak",
  "faq-cta",
  "footer",
] as const;

export type WhatsAppSource = (typeof WHATSAPP_SOURCES)[number];

export type BookingContext = {
  eventType?: string;
  service?: string;
  date?: string;
  time?: string;
  location?: string;
  mapsUrl?: string;
  people?: string;
  hairdo?: string;
  note?: string;
};

export function isWhatsAppSource(value: string | undefined): value is WhatsAppSource {
  return Boolean(value && WHATSAPP_SOURCES.includes(value as WhatsAppSource));
}

// Semua CTA publik mengarah ke satu formulir. Konteks pilihan dari halaman asal
// dibawa sebagai nilai awal supaya calon klien tidak perlu mengisinya lagi.
export function bookingFormUrl(source: WhatsAppSource, context: BookingContext = {}): string {
  const params = new URLSearchParams({ source });
  for (const [key, value] of Object.entries(context)) {
    const trimmed = value?.trim();
    if (trimmed) params.set(key, trimmed);
  }
  return `/kontak?${params.toString()}#form-booking`;
}

export function bookingMessage(input: { name: string } & BookingContext): string {
  const mapsUrl = input.mapsUrl?.trim();
  const note = input.note?.trim();

  return [
    "Halo Kak Ranni, saya ingin tanya/booking makeup.",
    "",
    "*Detail booking*",
    `Nama: ${input.name.trim()}`,
    `Jenis acara: ${input.eventType?.trim() || "-"}`,
    `Paket/layanan: ${input.service?.trim() || "-"}`,
    `Tanggal acara: ${input.date?.trim() || "-"}`,
    `Jam makeup: ${input.time?.trim() || "-"}`,
    `Jumlah orang: ${input.people?.trim() || "-"}`,
    `Hijab do/Hair do: ${input.hairdo?.trim() || "-"}`,
    "",
    "*Lokasi makeup*",
    `Alamat: ${input.location?.trim() || "-"}`,
    ...(mapsUrl ? ["Link Google Maps:", mapsUrl] : []),
    ...(note ? ["", "*Catatan*", note] : []),
    "",
    "*Info rekening*",
    "BCA: 7175262261",
    "a.n. Ranni Lestary",
  ].join("\n");
}

// Link untuk tombol di website: lewat halaman perantara supaya kliknya terhitung.
export function whatsappUrl(source: WhatsAppSource, message: string): string {
  return `/chat/${source}?text=${encodeURIComponent(message)}`;
}

// Link wa.me asli, dipakai halaman /chat untuk redirect. Nomor dari profil admin.
export function directWhatsappUrl(number: string, message: string = DEFAULT_WHATSAPP_MESSAGE): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
