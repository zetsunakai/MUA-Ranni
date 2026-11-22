import BrandLogos from "@/components/BrandLogos";
import { BookingCTA, ChapterHeading } from "@/components/editorial/Editorial";
import { ServiceComparison, ServiceSuite } from "@/components/editorial/ServiceSuite";
import { formatRupiah } from "@/lib/format";
import { getAddOns, getServiceGroups, lowestPrice } from "@/lib/prices";
import { getBrands } from "@/lib/brands";
import { getProfile } from "@/lib/profile";

export default async function ServicesContent({ embedded = false }: { embedded?: boolean }) {
  const [groups, addOns, profile, brands] = await Promise.all([getServiceGroups(), getAddOns(), getProfile(), getBrands()]);
  const Heading = embedded ? "h2" : "h1";
  const from = lowestPrice(groups);
  const booking = [{ label: "DP", text: profile.depositInfo }, { label: "Pelunasan", text: profile.paymentInfo }];
  return <section id="layanan-harga" aria-labelledby="layanan-harga-heading" className="scroll-mt-28">
    {/* Judul tetap ada untuk pembaca layar & SEO (h1 di /layanan), tapi tidak ditampilkan. */}
    <Heading id="layanan-harga-heading" className="sr-only">Layanan &amp; Harga</Heading>
    {from === null && <section className="editorial-container centered-opening"><p className="editorial-description">Layanan dan harga sedang diperbarui. Silakan hubungi WhatsApp untuk informasi layanan.</p></section>}
    <section className="editorial-container editorial-section pt-0!">
      <ChapterHeading label="Layanan & Harga" title="Pilih paket" />
      <div className="suite-grid">{groups.map(group => <ServiceSuite key={group.id} group={group} />)}</div>
    </section>
    <section className="editorial-container editorial-section pt-0!"><ChapterHeading label="Layanan & Harga" title="Termasuk" /><ServiceComparison groups={groups} /></section>
    {addOns.length > 0 && <section className="editorial-container editorial-section pt-0!"><ChapterHeading label="Layanan & Harga" title="Tambahan" /><div className="addon-grid">{addOns.map((addOn) => <article key={addOn.id}><h3 className="font-heading">{addOn.name}</h3>{addOn.note && <p className="editorial-description">{addOn.note}</p>}<p className="addon-price font-heading"><span>{formatRupiah(addOn.priceFrom)}</span>{addOn.priceTo && <>–<span>{formatRupiah(addOn.priceTo)}</span></>}</p></article>)}</div></section>}
    <section className="editorial-container editorial-section pt-0!"><div className="service-products"><div><h2 className="editorial-title">Produk yang dipakai</h2></div><BrandLogos brands={brands} /></div></section>
    <section className="product-band"><div className="editorial-container editorial-section"><ChapterHeading label="Sebelum booking" title={<>Booking &amp; <em>pembayaran.</em></>} /><div className="booking-terms-spread"><dl>{booking.map(b => <div key={b.label}><dt className="font-heading">{b.label}</dt><dd className="editorial-description">{b.text}</dd></div>)}</dl><div><h3 className="font-heading text-2xl">Syarat &amp; ketentuan</h3><ol className="terms-list">{profile.terms.map((term, i) => <li key={term}><span className="editorial-label">0{i + 1}</span><p>{term}</p></li>)}</ol></div></div></div></section>
    {!embedded && <BookingCTA compact />}
  </section>;
}
