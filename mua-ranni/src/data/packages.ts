import type { Package } from "@/types";

// DUMMY: ganti dengan paket dan harga asli.
export const packages: Package[] = [
  {
    id: "wisuda",
    name: "Wisuda",
    price: 350_000,
    includes: ["Makeup natural atau bold", "Hijab do atau hairdo simpel", "Softlens (opsional)"],
    durationHours: 1,
    notes: "Harga per orang. Diskon untuk 3 orang atau lebih.",
    order: 1,
  },
  {
    id: "engagement",
    name: "Engagement / Lamaran",
    price: 900_000,
    includes: ["Makeup", "Hairdo atau hijab do", "Touch up 1x", "Bulu mata premium"],
    durationHours: 3,
    order: 2,
  },
  {
    id: "bridal-akad",
    name: "Bridal Akad",
    price: 2_500_000,
    includes: ["Makeup akad", "Hairdo atau hijab do", "Aksesoris kepala", "Touch up sampai acara selesai"],
    durationHours: 5,
    order: 3,
  },
  {
    id: "bridal-premium",
    name: "Bridal Premium",
    price: 4_500_000,
    includes: [
      "Makeup akad dan resepsi",
      "2 look berbeda",
      "Makeup ibu pengantin (2 orang)",
      "Touch up sampai acara selesai",
      "Trial makeup 1x",
    ],
    durationHours: 10,
    notes: "Wajib DP 30% untuk mengunci tanggal.",
    order: 4,
  },
];

export const transportNote =
  "Gratis transport untuk area Depok. Di luar Depok dikenakan biaya transport mulai Rp100.000 sesuai jarak.";
