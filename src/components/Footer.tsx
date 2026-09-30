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
    <footer className="mt-auto bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl gap-10 border-t border-background/15 px-5 py-12 sm:px-6 md:grid-cols-4 md:gap-8">
        <div className="hidden md:block">
          <p className="font-heading text-3xl">{site.name}</p>
          <p className="mt-2 text-sm leading-relaxed text-background/75">{site.tagline}</p>
        </div>

        <FooterColumn title="Menu" className="hidden md:block">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:text-accent-soft hover:underline">
                {link.label}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Kontak">
          {socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} target={s.href.startsWith("/") ? undefined : "_blank"} rel={s.href.startsWith("/") ? undefined : "noopener noreferrer"} className="hover:text-accent-soft hover:underline">
                {s.label}
              </a>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Area & jam">
          <li>{profile.serviceAreas.join(" · ")}</li>
          <li>{profile.responseHours}</li>
        </FooterColumn>
      </div>

      <div className="mx-auto max-w-6xl px-5 pt-2 pb-24 sm:px-6 sm:pb-10">
        <p className="text-xs text-background/70">
          © {new Date().getFullYear()} {site.name}. Semua foto digunakan dengan izin klien.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <h2 className="text-[11px] font-medium uppercase tracking-[0.25em] text-background/70">{title}</h2>
      <ul className="mt-4 space-y-2 text-[15px]">{children}</ul>
    </div>
  );
}
