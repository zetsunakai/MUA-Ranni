import type { Metadata } from "next";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import PortfolioGallery from "@/components/PortfolioGallery";
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

  // Section before-after hanya muncul kalau admin sudah mengunggah foto "sebelum".
  // Foto unggulan didahulukan.
  const withBefore = items.filter((item) => item.beforeImageUrl);
  const showcase = withBefore.find((item) => item.featured) ?? withBefore[0];

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-14 sm:px-6 md:pt-24 md:pb-28">
        <PortfolioGallery
          items={items}
          categories={categories}
          heading={
            <>
              <p className="text-xs font-semibold tracking-[0.25em] text-accent-strong uppercase">Portofolio</p>
              <h1 className="mt-4 font-heading text-[56px] leading-[0.95] tracking-tight md:mt-5 md:text-8xl">
                Hasil riasan, <em>apa adanya.</em>
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-muted md:mt-5 md:text-lg">
                Semua foto adalah klien asli dan digunakan dengan izin.
                <span className="hidden md:inline"> Pilih kategori sesuai acaramu.</span>
              </p>
            </>
          }
        />
      </div>

      {showcase?.beforeImageUrl && (
        <section className="mx-auto w-full max-w-6xl px-5 pb-14 sm:px-6 md:pb-28">
          <div className="flex flex-col gap-5 rounded-lg bg-accent-soft p-6 md:flex-row-reverse md:items-center md:gap-16 md:p-14">
            <div className="md:flex-1">
              <p className="text-xs font-semibold tracking-[0.25em] text-accent-strong uppercase">Before &amp; After</p>
              <h2 className="mt-4 font-heading text-[38px] leading-none md:text-[56px]">Lihat bedanya sendiri.</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted md:mt-5 md:text-[17px]">
                Geser untuk membandingkan wajah sebelum dan sesudah dirias. Riasan menyesuaikan karakter wajah,
                bukan menutupinya.
              </p>
            </div>
            <div className="h-[360px] md:h-[480px] md:w-[55%] md:shrink-0">
              <BeforeAfterSlider
                beforeSrc={showcase.beforeImageUrl}
                afterSrc={showcase.imageUrl}
                alt={`${showcase.title}, riasan ${showcase.categoryLabel}`}
                sizes="(min-width: 768px) 620px, 100vw"
              />
            </div>
          </div>
        </section>
      )}

    </>
  );
}
