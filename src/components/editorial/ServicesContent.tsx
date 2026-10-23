import BrandLogos from "@/components/BrandLogos";
import { BookingCTA, ChapterHeading } from "@/components/editorial/Editorial";
import { ServiceComparison, ServiceSuite } from "@/components/editorial/ServiceSuite";
import { bookingInfo, brands, terms } from "@/data/services";
import { formatRupiah } from "@/lib/format";
import { getAddOns, getServiceGroups, lowestPrice } from "@/lib/prices";

export default async function ServicesContent({ embedded = false }: { embedded?: boolean }) {
  const [groups, addOns] = await Promise.all([getServiceGroups(), getAddOns()]);
  const Heading = embedded ? "h2" : "h1";
  const from = lowestPrice(groups);
  const booking = [{ label: "Transport", text: bookingInfo.transport }, { label: "DP", text: bookingInfo.deposit }, { label: "Pelunasan", text: bookingInfo.payment }];
  return <section id="layanan-harga" aria-labelledby="layanan-harga-heading" className="scroll-mt-28">
    <section className="editorial-container centered-opening"><p className="editorial-label">Price list 2026</p><Heading id="layanan-harga-heading" className="editorial-display">Harga jelas, <em>per orang.</em></Heading><p className="editorial-description">{from === null ? "Layanan dan harga sedang diperbarui. Silakan hubungi WhatsApp untuk informasi layanan." : <>Mulai {formatRupiah(from)} per orang. Ketuk salah satu layanan untuk langsung booking lewat WhatsApp.</>}</p>
      <div className="booking-policy"><span aria-hidden="true">✧</span><div><p className="editorial-label">Sebelum booking</p><p>{bookingInfo.deposit}</p></div><span className="editorial-label">DP</span></div>
    </section>
    <section className="editorial-container editorial-section pt-0!">
      <ChapterHeading label="Layanan & Harga" title="Pilih paket"><p>Pilih paket, lalu lanjutkan ke WhatsApp untuk cek jadwal.</p></ChapterHeading>
      <div className="suite-grid">{groups.map(group => <ServiceSuite key={group.id} group={group} />)}</div>
    </section>
    <section className="editorial-container editorial-section pt-0!"><ChapterHeading label="Layanan & Harga" title="Termasuk" /><ServiceComparison groups={groups} /></section>
    {addOns.length > 0 && <section className="editorial-container editorial-section pt-0!"><ChapterHeading label="Layanan & Harga" title="Tambahan"><p>Bisa ditambahkan ke layanan apa pun.</p></ChapterHeading><div className="addon-grid">{addOns.map((addOn, index) => <article key={addOn.id}><span className="editorial-label">0{index + 1} · Tambahan</span><h3 className="font-heading">{addOn.name}</h3>{addOn.note && <p className="editorial-description">{addOn.note}</p>}<p className="addon-price font-heading"><span>{formatRupiah(addOn.priceFrom)}</span>{addOn.priceTo && <>–<span>{formatRupiah(addOn.priceTo)}</span></>}</p></article>)}</div></section>}
    <section className="editorial-container editorial-section pt-0!"><div className="service-products"><div><p className="editorial-label">Tentang</p><h2 className="editorial-title">Produk yang dipakai</h2></div><BrandLogos brands={brands} /></div></section>
    <section className="product-band"><div className="editorial-container editorial-section"><ChapterHeading label="Sebelum booking" title={<>Booking &amp; <em>pembayaran.</em></>} /><div className="booking-terms-spread"><dl>{booking.map(b => <div key={b.label}><dt className="font-heading">{b.label}</dt><dd className="editorial-description">{b.text}</dd></div>)}</dl><div><h3 className="font-heading text-2xl">Syarat &amp; ketentuan</h3><ol className="terms-list">{terms.map((term, i) => <li key={term}><span className="editorial-label">0{i + 1}</span><p>{term}</p></li>)}</ol></div></div></div></section>
    {!embedded && <BookingCTA compact />}
  </section>;
}
