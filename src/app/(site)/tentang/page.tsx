import type { Metadata } from "next";
import Image from "next/image";
import Approach from "@/components/editorial/Approach";
import { BookingCTA, ChapterHeading, QuotePanel } from "@/components/editorial/Editorial";
import BrandLogos from "@/components/BrandLogos";
import { about } from "@/data/about";
import { bookingInfo, brands } from "@/data/services";
import { site } from "@/data/site";
import { getProfile } from "@/lib/profile";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return { title: "Tentang", description: `Kenalan dengan ${site.name}: makeup artist wisuda, pesta, dan acara pernikahan di ${profile.serviceAreas.join(", ")}.`, alternates: { canonical: "/tentang" } };
}

export default async function TentangPage() {
  const profile = await getProfile();
  return <>
    <section className="editorial-container profile-spread">
      <div className="profile-story"><p className="editorial-label">Tentang · Ranni Tary Makeup</p><h1 className="editorial-display">{/[.!?]$/.test(profile.greeting.trim()) ? profile.greeting : `${profile.greeting}.`}</h1>
        {profile.bio.map((paragraph, i) => <p key={paragraph} className={i === 0 ? "profile-intro" : "editorial-description mt-5"}>{paragraph}</p>)}
        <dl className="profile-facts">{profile.serviceAreas.map(area => <div key={area}><dt>Area layanan</dt><dd>{area}</dd></div>)}</dl>
      </div>
      <figure className="profile-portrait"><div className="portrait-mat"><p className="editorial-label mb-5">Ranni Tary · Makeup artist</p><div className="portrait-image"><Image src={about.photoUrl} alt={about.photoAlt} fill preload sizes="(min-width: 1024px) 440px, (min-width: 768px) 40vw, 85vw" className="object-cover" /></div><figcaption><span>Home service</span><span>{profile.serviceAreas.join(" · ")}</span></figcaption></div><div className="portrait-footnote"><span>Instagram</span><a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer">@{profile.instagramHandle} ↗</a></div></figure>
    </section>
    {profile.bio[1] && <QuotePanel label="Cara aku merias" quote={profile.bio[1]} name="Ranni Tary" />}
    <Approach />
    <section className="product-band"><div className="editorial-container editorial-section"><ChapterHeading label="Tentang" title="Produk yang dipakai"><p>{profile.bio[2]}</p></ChapterHeading><BrandLogos brands={brands} /></div></section>
    <section className="editorial-container editorial-section area-spread"><div><p className="editorial-label">Home service</p><h2 className="editorial-title">Area layanan</h2><p className="editorial-description mt-5">{bookingInfo.transport}</p></div><div>{profile.serviceAreas.map((area, index) => <div className="area-row" key={area}><span className="editorial-label">0{index + 1}</span><h3 className="font-heading">{area}</h3><span className="editorial-label">Home service</span></div>)}<p className="editorial-label mt-6">{profile.responseHours}</p></div></section>
    <BookingCTA />
  </>;
}
