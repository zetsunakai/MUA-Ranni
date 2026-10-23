import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookingCTA, ChapterHeading, QuotePanel } from "@/components/editorial/Editorial";
import ServicesContent from "@/components/editorial/ServicesContent";
import ClientQuotes from "@/components/editorial/ClientQuotes";
import LookbookPreview from "@/components/home/LookbookPreview";
import { about } from "@/data/about";
import { getCategories } from "@/lib/categories";
import { getPortfolioItems } from "@/lib/portfolio";
import { getProfile } from "@/lib/profile";
import { getPublicTestimonials } from "@/lib/testimonials";
import { bookingFormUrl } from "@/lib/whatsapp";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const [portfolio, categories, profile, testimonials] = await Promise.all([
    getPortfolioItems(), getCategories(), getProfile(), getPublicTestimonials(),
  ]);
  return <>
    <section className="editorial-container profile-spread home-spread">
      <div className="profile-story">
        <p className="editorial-label">Wisuda · Pesta · Pernikahan — Bogor</p>
        <h1 className="editorial-display">Hari istimewamu,<br /><em>tampilan terbaikmu.</em></h1>
        <p className="profile-intro">Makeup untuk pernikahan, wisuda, dan setiap momen yang ingin kamu kenang selamanya.</p>
        <p className="editorial-description">Riasan disesuaikan dengan wajah dan busanamu, dikerjakan langsung di lokasimu.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link href={bookingFormUrl("hero")} className="editorial-button editorial-button-primary">Chat WhatsApp</Link><Link href="/portfolio" className="editorial-button editorial-button-outline">Lihat portofolio</Link></div>
        <dl className="profile-facts"><div><dt>Home service</dt><dd>Datang ke lokasimu</dd></div><div><dt>Termasuk</dt><dd>Bulu mata &amp; hijab do termasuk</dd></div><div><dt>Jam respon chat</dt><dd>{profile.responseHours}</dd></div></dl>
      </div>
      <figure className="profile-portrait"><div className="portrait-mat"><div className="portrait-image"><Image src={about.photoUrl} alt={about.photoAlt} fill preload sizes="(min-width: 1024px) 440px, (min-width: 768px) 40vw, 85vw" className="object-cover" /></div><figcaption><span>Ranni Tary</span><span>Makeup artist</span></figcaption></div><div className="portrait-footnote"><span>Home service · Bogor</span><Link href="/tentang">Tentang →</Link></div></figure>
    </section>
    {profile.bio[1] && <QuotePanel label="Tentang" quote={profile.bio[1]} name="Ranni Tary" />}
    <section className="editorial-container editorial-section">
      <ChapterHeading label="Portofolio" title="Hasil riasan pilihan"><p>Semua foto adalah klien asli dan digunakan dengan izin. Pilih kategori sesuai acaramu.</p></ChapterHeading>
      <LookbookPreview items={portfolio} categories={categories} />
      <Link href="/portfolio" className="editorial-text-link">Lihat semua portofolio →</Link>
    </section>
    <ServicesContent embedded />
    {testimonials.length > 0 && <div className="editorial-container"><ClientQuotes testimonials={testimonials} /></div>}
    <BookingCTA />
  </>;
}
