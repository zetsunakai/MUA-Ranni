import type { Testimonial } from "@/types";

// DUMMY, hanya dipakai kalau database belum disambungkan (misalnya di laptop tanpa .env.local).
// Testimoni asli diisi klien lewat link undangan dan disetujui di /admin/testimoni.
// Selama flag ini true, data dummy tidak pernah tampil di website production.
export const testimonialsArePlaceholder = true;

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    clientName: "Nadia",
    eventType: "bridal",
    quote: "Makeup-nya awet dari akad sampai resepsi malam, sama sekali nggak crack. Keluarga juga puas semua.",
  },
  {
    id: "t2",
    clientName: "Salsa",
    eventType: "wisuda",
    quote: "Datang pagi-pagi tepat waktu, hasilnya natural tapi tetap keliatan di foto. Recommended!",
  },
  {
    id: "t3",
    clientName: "Rara",
    eventType: "engagement",
    quote: "Aku minta look soft peach dan hasilnya persis sama referensi. Kakaknya sabar banget.",
  },
  {
    id: "t4",
    clientName: "Studio Lensa Kita",
    eventType: "photoshoot",
    quote: "Paham kebutuhan kamera, detail kulit rapi di close-up. Sudah langganan untuk shoot brand.",
  },
  {
    id: "t5",
    clientName: "Dewi",
    eventType: "bridal",
    quote: "Paes Jawa-nya rapi dan pas di wajah. Yang lihat foto nikahan semua nanya MUA-nya siapa.",
  },
];
