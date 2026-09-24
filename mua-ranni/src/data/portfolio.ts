import type { PortfolioItem } from "@/types";

// DUMMY: foto dari Unsplash (lisensi gratis), bukan hasil kerja MUA.
// WAJIB diganti foto asli klien (dengan izin) sebelum launch.
function unsplash(photoId: string, extraParams = ""): string {
  return `https://images.unsplash.com/photo-${photoId}?w=1600&q=80${extraParams}`;
}

// Foto "sebelum" dummy: foto yang sama dibuat pucat lewat parameter imgix Unsplash.
// Nanti diganti foto sebelum-sesudah asli dengan sudut dan cahaya yang sama.
const DUMMY_BEFORE = "&sat=-75&bri=-8&con=-30";

export const portfolioItems: PortfolioItem[] = [
  {
    id: "bridal-sunda-siger",
    title: "Akad Adat Sunda Siger",
    category: "bridal",
    imageUrl: unsplash("1788065913600-33e6bffbc338"),
    beforeImageUrl: unsplash("1788065913600-33e6bffbc338", DUMMY_BEFORE),
    description: "Riasan akad adat Sunda dengan siger dan hijab, flawless tahan sampai resepsi.",
    featured: true,
    createdAt: "2026-08-17",
  },
  {
    id: "bridal-hijab-melati",
    title: "Akad Hijab Melati Putih",
    category: "bridal",
    imageUrl: unsplash("1771495307120-dd557e4db001"),
    description: "Look akad lembut dengan ronce melati dan veil putih.",
    featured: false,
    createdAt: "2026-07-05",
  },
  {
    id: "bridal-resepsi-biru",
    title: "Resepsi Hijab Biru Glam",
    category: "bridal",
    imageUrl: unsplash("1775179799840-405a6c8b5458"),
    description: "Riasan resepsi glam yang serasi dengan gaun payet biru.",
    featured: true,
    createdAt: "2026-06-21",
  },
  {
    id: "bridal-akad-simpel",
    title: "Akad Simpel Natural",
    category: "bridal",
    imageUrl: unsplash("1764641697973-1e55796073bf"),
    description: "Riasan natural fresh untuk akad intimate di rumah.",
    featured: false,
    createdAt: "2026-05-10",
  },
  {
    id: "wisuda-soft-pink",
    title: "Wisuda Hijab Soft Pink",
    category: "wisuda",
    imageUrl: unsplash("1704859639593-c27cee9b516a"),
    beforeImageUrl: unsplash("1704859639593-c27cee9b516a", DUMMY_BEFORE),
    description: "Makeup wisuda soft pink yang tetap natural di foto outdoor.",
    featured: true,
    createdAt: "2026-09-02",
  },
  {
    id: "wisuda-hijab-natural",
    title: "Wisuda Hijab Natural",
    category: "wisuda",
    imageUrl: unsplash("1648915742771-516fc4196954"),
    featured: false,
    createdAt: "2026-08-28",
  },
  {
    id: "wisuda-flawless",
    title: "Wisuda Flawless Seharian",
    category: "wisuda",
    imageUrl: unsplash("1698678087668-268560742d03"),
    featured: false,
    createdAt: "2026-03-15",
  },
  {
    id: "wisuda-glowing",
    title: "Wisuda Glowing Outdoor",
    category: "wisuda",
    imageUrl: unsplash("1618355776464-8666794d2520"),
    featured: false,
    createdAt: "2026-03-14",
  },
  {
    id: "engagement-hijau-emas",
    title: "Lamaran Hijab Hijau Emas",
    category: "engagement",
    imageUrl: unsplash("1758141069057-8f9ef1d4a9d2"),
    description: "Riasan lamaran bold dengan aksen emas, serasi dengan busana kuning-hijau.",
    featured: true,
    createdAt: "2026-07-20",
  },
  {
    id: "engagement-pink-gold",
    title: "Lamaran Glam Pink Gold",
    category: "engagement",
    imageUrl: unsplash("1717269127187-c0517b1e15b4"),
    featured: false,
    createdAt: "2026-06-01",
  },
  {
    id: "engagement-adat-melayu",
    title: "Tunangan Adat Melayu",
    category: "engagement",
    imageUrl: unsplash("1692899189376-c9f179f9dc49"),
    featured: false,
    createdAt: "2026-04-12",
  },
  {
    id: "engagement-outdoor-lilac",
    title: "Engagement Outdoor Lilac",
    category: "engagement",
    imageUrl: unsplash("1637773321147-24110523bbf9"),
    featured: false,
    createdAt: "2026-02-22",
  },
  {
    id: "photoshoot-graphic-liner",
    title: "Editorial Graphic Liner",
    category: "photoshoot",
    imageUrl: unsplash("1611826585949-b0ccabd2c1a4"),
    description: "Graphic eyeliner dan kulit dewy untuk shoot editorial.",
    featured: true,
    createdAt: "2026-08-09",
  },
  {
    id: "photoshoot-pink-smokey",
    title: "Beauty Pink Smokey",
    category: "photoshoot",
    imageUrl: unsplash("1648249969490-44f3052a3721"),
    featured: true,
    createdAt: "2026-03-01",
  },
  {
    id: "photoshoot-bronze-glow",
    title: "Bronze Glow Editorial",
    category: "photoshoot",
    imageUrl: unsplash("1744371386847-ded3b4a66017"),
    featured: false,
    createdAt: "2026-01-18",
  },
  {
    id: "photoshoot-bunga-kuning",
    title: "Editorial Bunga Kuning",
    category: "photoshoot",
    imageUrl: unsplash("1618068291962-bb16bfca7f0f"),
    featured: false,
    createdAt: "2026-01-05",
  },
];
