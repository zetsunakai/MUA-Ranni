import type { Metadata } from "next";
import Link from "next/link";
import BookingForm from "@/components/BookingForm";
import { site } from "@/data/site";
import { getCategories } from "@/lib/categories";
import { getServiceGroups } from "@/lib/prices";
import { getProfile } from "@/lib/profile";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return { title: "Kontak", description: `Booking ${site.name} lewat WhatsApp ${profile.whatsappDisplay}. Area layanan ${profile.serviceAreas.join(", ")}.`, alternates: { canonical: "/kontak" } };
}

export default async function KontakPage() {
  const [profile, categories, groups] = await Promise.all([getProfile(), getCategories(), getServiceGroups()]);
  const serviceGroups = groups.map(group => ({ id: group.id, name: group.name, items: group.items.map(item => ({ id: item.id, name: item.name })) }));
  const bookingSteps = [
    { title: "Isi formulir", text: "Lengkapi detail acara, lalu periksa pesan yang disiapkan di WhatsApp." },
    { title: "Bayar DP", text: profile.depositInfo }, { title: "Pelunasan", text: profile.paymentInfo },
  ];
  const faq = [
    { q: "Berapa DP-nya dan kapan pelunasan?", a: `${profile.depositInfo} ${profile.paymentInfo}` },
    { q: "Bagaimana kalau cancel atau ganti tanggal?", a: profile.terms.filter(t => /^(Cancel|Reschedule)/i.test(t)).join(" ") },
  ].filter(f => f.a.trim());
  return <>
    <section className="contact-opening product-band"><div className="editorial-container">
      <div><h1 className="editorial-display">Mulai booking <em>di sini.</em></h1><p className="profile-intro">Isi detail acara di formulir. Pesan yang rapi akan disiapkan untuk kamu kirim lewat WhatsApp.</p></div>
      <div className="response-card"><p className="editorial-label">Jam respon chat</p><p className="font-heading">{profile.responseHours}</p><Link href="/jadwal" className="editorial-text-link">Cek tanggal kosong dulu? →</Link></div>
    </div></section>
    <div className="editorial-container booking-spread">
      <div><BookingForm eventTypes={categories} serviceGroups={serviceGroups} bank={{ accounts: profile.bankAccounts, name: profile.bankAccountName }} /></div>
      <aside className="booking-sidebar">
        <section className="concierge-panel"><p className="editorial-label">WhatsApp · {profile.whatsappDisplay}</p><h2 className="font-heading">Chat WhatsApp</h2><p>Tanya langsung lewat WhatsApp, dibalas secepatnya.</p><a href="#form-booking" className="editorial-button">Isi formulir →</a></section>
        <section className="sidebar-panel"><h2 className="font-heading">{profile.location.name}</h2><iframe src={profile.location.embedUrl} title={`Peta area ${profile.location.address}`} width="600" height="220" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen className="my-5 h-[200px] w-full border-0 bg-sand" /><p className="editorial-description">{profile.location.address}</p><a href={profile.location.mapsUrl} target="_blank" rel="noopener noreferrer" className="editorial-text-link">Buka Google Maps →</a><p className="editorial-label mt-5">Area layanan</p><p className="editorial-description mt-2">{profile.serviceAreas.join(" · ")}</p><a className="editorial-text-link" href={profile.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram @{profile.instagramHandle}</a>{profile.tiktokUrl && <a className="editorial-text-link ml-4" href={profile.tiktokUrl} target="_blank" rel="noopener noreferrer">TikTok</a>}</section>
        <section className="sidebar-panel"><h2 className="font-heading">Tiga langkah, <em>jadwal aman.</em></h2><ol className="booking-timeline">{bookingSteps.map((step, i) => <li key={step.title}><span className="editorial-label">0{i + 1}</span><h3 className="font-heading">{step.title}</h3><p className="editorial-description">{step.text}</p></li>)}</ol></section>
        <section className="sidebar-panel"><h2 className="font-heading">Yang sering <em>ditanyakan.</em></h2><div className="sidebar-faq">{faq.map(f => <details key={f.q}><summary>{f.q}<span aria-hidden="true">+</span></summary><p className="editorial-description">{f.a}</p></details>)}</div><p className="mt-5 text-xs text-muted">Pertanyaan soal DP, cancel, atau persiapan?</p><Link href="/faq" className="editorial-text-link">Lihat FAQ →</Link></section>
      </aside>
    </div>
    <section className="photo-consent product-band"><h2 className="font-heading">Semua foto adalah klien asli<br />dan digunakan dengan izin.</h2><p className="editorial-description">Lihat tanggal yang masih tersedia, lalu kirim detail acaramu dari halaman Jadwal.</p><Link href="/jadwal" className="editorial-text-link">Lihat jadwal →</Link></section>
  </>;
}
