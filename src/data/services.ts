import type { AddOn, Brand, ServiceGroup } from "@/types";

// Sumber: Price List Rannitary_makeup 2026.pdf

const REGULER_INCLUDES = ["Free bulu mata", "Hijab do simple"];
const PREMIUM_INCLUDES = ["Free bulu mata premium", "Softlens normal", "Hijab do simple"];

export const serviceGroups: ServiceGroup[] = [
  {
    id: "reguler-anak",
    name: "Reguler Anak",
    tier: "reguler",
    includes: REGULER_INCLUDES,
    order: 1,
    items: [
      { id: "anak-tk", name: "Anak TK", price: 75_000 },
      { id: "anak-tari", name: "Anak Tari", price: 85_000 },
      { id: "wisuda-sd", name: "Wisuda SD", price: 100_000 },
      { id: "wisuda-smp", name: "Wisuda SMP", price: 125_000 },
      { id: "anak-pagar-ayu-party", name: "Pagar Ayu, Party, dan lain-lain", price: 125_000 },
    ],
  },
  {
    id: "reguler-dewasa",
    name: "Reguler Dewasa",
    tier: "reguler",
    includes: REGULER_INCLUDES,
    order: 2,
    items: [
      { id: "bridesmaid", name: "Bridesmaid / Pagar Ayu", price: 150_000 },
      { id: "wisuda-sma", name: "Wisuda SMA", price: 150_000 },
      { id: "sister-of-groom-bride", name: "Sister of Groom / Bride", price: 150_000 },
      { id: "tari-dewasa", name: "Tari Dewasa", price: 150_000 },
      { id: "dewasa-event-party", name: "Acara Event, Party, dan lain-lain", price: 150_000 },
    ],
  },
  {
    id: "reguler-mom",
    name: "Reguler Mom",
    tier: "reguler",
    includes: REGULER_INCLUDES,
    order: 3,
    items: [
      { id: "mom-pendamping-wisuda", name: "Pendamping Wisuda", price: 150_000 },
      { id: "mom-of-groom-bride", name: "Mom of Groom / Bride", price: 150_000 },
      { id: "mom-event-party", name: "Acara Event, Party, dan lain-lain", price: 150_000 },
    ],
  },
  {
    id: "premium-dewasa",
    name: "Premium Dewasa",
    tier: "premium",
    includes: PREMIUM_INCLUDES,
    order: 4,
    items: [
      { id: "premium-wisuda", name: "Wisuda SMA / Kuliah", price: 225_000 },
      { id: "premium-pendamping-wisuda", name: "Pendamping Wisuda", price: 175_000 },
      { id: "premium-bridesmaid", name: "Bridesmaid / Pagar Ayu", price: 175_000 },
      { id: "premium-sister", name: "Sister of Groom / Bride", price: 175_000 },
      { id: "premium-photoshoot", name: "Photoshoot", price: 175_000 },
      { id: "premium-event-party", name: "Acara Event, Party, dan lain-lain", price: 175_000 },
    ],
  },
  {
    // Di PDF judulnya juga "Premium Dewasa"; dinamai ulang supaya tidak kembar di website.
    id: "premium-pernikahan",
    name: "Premium Acara Pernikahan",
    tier: "premium",
    includes: PREMIUM_INCLUDES,
    order: 5,
    items: [
      { id: "akad", name: "Akad only (tanpa retouch)", price: 350_000 },
      { id: "prewedding", name: "Prewedding", price: 250_000 },
      { id: "lamaran", name: "Lamaran", price: 250_000 },
      { id: "siraman", name: "Siraman", price: 250_000 },
      { id: "pengajian", name: "Pengajian Pernikahan", price: 200_000 },
      { id: "groom", name: "Groom", price: 150_000 },
    ],
  },
];

export const addOns: AddOn[] = [
  { id: "hairdo", name: "Hair do simple", priceFrom: 50_000, priceTo: 150_000, note: "Sesuai request" },
  { id: "softlens", name: "Tambahan softlens", priceFrom: 40_000 },
];

export const bookingInfo = {
  transport: "Gratis transport sampai 3 km. Lebih dari itu dikenakan Rp2.500/km.",
  deposit: "Booking dengan DP Rp50.000–100.000 setelah tanggal dan lokasi makeup fix.",
  payment: "Pelunasan bisa dilakukan saat hari H.",
};

export const terms: string[] = [
  "Semua harga tidak bisa ditawar karena sudah sesuai perhitungan biaya produk makeup.",
  "Cancel = DP hangus dan tidak dapat dikembalikan.",
  "Reschedule hanya dapat dilakukan 1x, mengikuti jadwal yang kosong.",
  "Jam makeup harus sesuai dengan yang sudah disepakati.",
  "Client sudah siap ketika MUA sampai di lokasi.",
  "Jika ada, mohon sediakan meja dan 2 kursi untuk makeup demi kenyamanan client dan MUA.",
  "Untuk client berhijab, hijab dan dalaman hijab sudah disetrika rapi dan disiapkan, jadi MUA tinggal memakaikan.",
];

// Logo di public/images/brands. Sumber:
// - situs resmi brand / Wikimedia (public domain): LT Pro, Wardah, Make Over, Artisan, MUAQ,
//   Maybelline, Vaseline, Judydoll. Logo putih (MUAQ, Judydoll, Make Over, Maybelline)
//   diubah jadi gelap supaya terbaca di kartu putih.
// - file dari pemilik project: Browit, ESQA, Hada Labo, Inez, Mercredi, Pramy, Reveline, Sea Makeup.
// width/height = ukuran asli file, dipakai next/image dan untuk menyeimbangkan ukuran tampil.
export const brands: Brand[] = [
  { name: "LT Pro", logo: "/images/brands/lt-pro.webp", width: 193, height: 153 },
  { name: "Browit", logo: "/images/brands/browit.webp", width: 480, height: 151 },
  { name: "Wardah", logo: "/images/brands/wardah.webp", width: 246, height: 47 },
  { name: "Make Over", logo: "/images/brands/make-over.webp", width: 224, height: 100 },
  { name: "Hada Labo", logo: "/images/brands/hada-labo.webp", width: 480, height: 447 },
  { name: "Inez", logo: "/images/brands/inez.webp", width: 480, height: 480 },
  { name: "Mercredi", logo: "/images/brands/mercredi.webp", width: 353, height: 44 },
  { name: "Artisan Professionnel", logo: "/images/brands/artisan.webp", width: 480, height: 119 },
  { name: "MUAQ", logo: "/images/brands/muaq.webp", width: 480, height: 108 },
  { name: "Reveline", logo: "/images/brands/reveline.webp", width: 480, height: 222 },
  { name: "Pramy", logo: "/images/brands/pramy.webp", width: 352, height: 60 },
  { name: "Sea Makeup", logo: "/images/brands/sea-makeup.webp", width: 353, height: 64 },
  { name: "Maybelline", logo: "/images/brands/maybelline.svg", width: 155, height: 25 },
  { name: "ESQA", logo: "/images/brands/esqa.webp", width: 480, height: 164 },
  { name: "Vaseline", logo: "/images/brands/vaseline.svg", width: 203, height: 140 },
  { name: "Judydoll", logo: "/images/brands/judydoll.webp", width: 480, height: 48 },
];
