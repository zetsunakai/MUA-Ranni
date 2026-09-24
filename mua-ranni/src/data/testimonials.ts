import type { Testimonial } from "@/types";

// DUMMY: ganti dengan testimoni asli (dengan izin klien), lalu ubah flag di bawah jadi false.
// Selama masih true, section testimoni tidak tampil di website production (lihat lib/testimonials.ts)
// supaya pengunjung tidak membaca ulasan karangan sebagai ulasan asli.
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
