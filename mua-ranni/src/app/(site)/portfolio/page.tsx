import type { Metadata } from "next";
import PortfolioGallery from "@/components/PortfolioGallery";
import SectionHeading from "@/components/SectionHeading";
import { getCategories } from "@/lib/categories";
import { getPortfolioItems } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Portofolio",
  description: "Hasil riasan bridal, wisuda, engagement, dan photoshoot. Filter per kategori dan lihat sebelum-sesudah.",
};

// Server Component: data dibaca dari database saat build (statis), lalu diteruskan ke
// PortfolioGallery yang interaktif. Setelah admin mengubah portofolio,
// revalidatePath("/portfolio") membuat ulang halaman ini.
export default async function PortfolioPage() {
  const [items, categories] = await Promise.all([getPortfolioItems(), getCategories()]);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading
        as="h1"
        eyebrow="Portofolio"
        title="Hasil riasan"
        description="Pilih kategori sesuai acaramu, lalu ketuk foto untuk melihat lebih dekat."
      />
      <div className="mt-8">
        <PortfolioGallery items={items} categories={categories} />
      </div>
    </section>
  );
}
