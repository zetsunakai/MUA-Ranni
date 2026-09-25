import type { Metadata } from "next";
import PortfolioGallery from "@/components/PortfolioGallery";
import SectionHeading from "@/components/SectionHeading";
import { portfolioItems } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "Portofolio",
  description: "Hasil riasan bridal, wisuda, engagement, dan photoshoot. Filter per kategori dan lihat sebelum-sesudah.",
};

// Server Component: data disiapkan di sini (nanti Tahap 3 diganti query Supabase),
// lalu diteruskan ke PortfolioGallery yang interaktif.
export default function PortfolioPage() {
  const items = [...portfolioItems].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading
        as="h1"
        eyebrow="Portofolio"
        title="Hasil riasan"
        description="Pilih kategori sesuai acaramu, lalu ketuk foto untuk melihat lebih dekat."
      />
      <div className="mt-8">
        <PortfolioGallery items={items} />
      </div>
    </section>
  );
}
