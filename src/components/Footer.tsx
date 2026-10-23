// Server Component: tidak ada state atau event handler, jadi tidak perlu "use client".

import Link from "next/link";
import { navLinks, site } from "@/data/site";
import { getProfile } from "@/lib/profile";
import { bookingFormUrl } from "@/lib/whatsapp";

export default async function Footer() {
  const profile = await getProfile();
  const socials = [
    { href: bookingFormUrl("footer"), label: `WhatsApp ${profile.whatsappDisplay}` },
    { href: profile.instagramUrl, label: `Instagram @${profile.instagramHandle}` },
    ...(profile.tiktokUrl ? [{ href: profile.tiktokUrl, label: "TikTok" }] : []),
  ];

  return (
    <footer className="site-footer mt-auto border-t border-line bg-accent-soft/50 text-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-6 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1fr_1.2fr] lg:gap-12">
        <div className="block">
          <p className="font-heading text-2xl uppercase">{site.name}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{site.tagline}</p>
        </div>

        <FooterColumn title="Menu" className="block">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link prefetch={true} href={link.href} className="hover:text-accent-strong hover:underline">
                {link.label}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Kontak">
          {socials.map((s) => (
            <li key={s.label}>
              {s.href.startsWith("/") ? <Link href={s.href} className="hover:text-accent-strong hover:underline">{s.label}</Link> : <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-accent-strong hover:underline">{s.label}</a>}
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Lokasi & layanan" className="min-w-0">
          <li>{site.location.address}</li>
          <li>
            <a
              href={site.location.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center hover:text-accent-strong hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            >
              Buka Google Maps →
            </a>
          </li>
          <li>{profile.serviceAreas.join(" · ")}</li>
          <li>{profile.responseHours}</li>
        </FooterColumn>
      </div>

      <div className="mx-auto max-w-6xl px-5 pt-2 pb-24 sm:px-6 sm:pb-10">
        <p className="border-t border-line pt-6 text-[10px] tracking-[0.12em] text-muted uppercase">
          © {new Date().getFullYear()} {site.name}. Semua foto digunakan dengan izin klien.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <h2 className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted">{title}</h2>
      <ul className="mt-4 space-y-2 text-xs leading-relaxed">{children}</ul>
    </div>
  );
}
