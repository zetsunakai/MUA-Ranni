import type { Metadata } from "next";
import Image from "next/image";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import PortfolioGallery from "@/components/PortfolioGallery";
import { BookingCTA, ChapterHeading } from "@/components/editorial/Editorial";
import ClientQuotes from "@/components/editorial/ClientQuotes";
import { getCategories } from "@/lib/categories";
import { getPortfolioItems } from "@/lib/portfolio";
import { getPublicTestimonials } from "@/lib/testimonials";

export const metadata: Metadata = {
  title: "Portofolio",
  description: "Hasil riasan bridal, wisuda, engagement, dan photoshoot. Filter per kategori dan lihat sebelum-sesudah.",
  alternates: { canonical: "/portfolio" },
};

export default async function PortfolioPage() {
  const [items, categories, testimonials] = await Promise.all([getPortfolioItems(), getCategories(), getPublicTestimonials()]);
  const withBefore = items.filter(item => item.beforeImageUrl);
  const showcase = withBefore.find(item => item.featured) ?? withBefore[0];
  const details = items.filter(item => item.featured).slice(0, 3);
  return <>
    <section className="editorial-container editorial-section portfolio-opening">
      <PortfolioGallery items={items} categories={categories} heading={<>
        <div><p className="editorial-label">Portofolio</p><h1 className="editorial-display">Hasil riasan,<br /><em>apa adanya.</em></h1></div>
        <p className="editorial-description">Semua foto adalah klien asli dan digunakan dengan izin. Pilih kategori sesuai acaramu.</p>
      </>} />
    </section>
    {showcase?.beforeImageUrl && <section className="product-band"><div className="editorial-container editorial-section">
      <ChapterHeading label="Before & After" title="Lihat bedanya sendiri."><p>Geser untuk membandingkan wajah sebelum dan sesudah dirias.</p></ChapterHeading>
      <div className="transformation-spread"><figure className="transformation-photo"><div className="h-[360px] md:h-[520px]"><BeforeAfterSlider beforeSrc={showcase.beforeImageUrl} afterSrc={showcase.imageUrl} alt={`${showcase.title}, riasan ${showcase.categoryLabel}`} sizes="(min-width: 1024px) 730px, 90vw" /></div><figcaption className="portrait-footnote"><span>{showcase.title}</span><span>{showcase.categoryLabel}</span></figcaption></figure>
        <div className="transformation-notes"><div><p className="editorial-label">01 · Before &amp; After</p><h3 className="font-heading">Menyesuaikan wajah &amp; busana</h3><p className="editorial-description">Riasan menyesuaikan karakter wajah, bukan menutupinya.</p></div><div><p className="editorial-label">02 · {showcase.categoryLabel}</p><h3 className="font-heading">{showcase.title}</h3><p className="editorial-description">{showcase.description}</p></div><div><p className="editorial-label">03 · Portofolio</p><p className="editorial-description">Semua foto adalah klien asli dan digunakan dengan izin.</p></div></div>
      </div>
    </div></section>}
    {details.length > 0 && <section className="editorial-container editorial-section"><div className="text-center"><p className="editorial-label">Portofolio</p><h2 className="editorial-title">Hasil riasan pilihan</h2></div><div className="detail-look-grid">{details.map(item => <figure key={item.id}><div className="relative aspect-square"><Image src={item.imageUrl} alt={`${item.title}, riasan ${item.categoryLabel}`} fill sizes="(min-width: 1024px) 350px, (min-width: 640px) 28vw, 85vw" className="object-cover" /></div><figcaption><p className="editorial-label">{item.categoryLabel}</p><h3 className="font-heading">{item.title}</h3><p className="editorial-description">{item.description}</p></figcaption></figure>)}</div></section>}
    {testimonials.length > 0 && <div className="editorial-container"><ClientQuotes testimonials={testimonials} /></div>}
    <BookingCTA compact />
  </>;
}
