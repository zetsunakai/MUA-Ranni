// Server Component: tidak ada state atau event handler, jadi tidak perlu "use client".

import Link from "next/link";
import { navLinks, site } from "@/data/site";
import { whatsappUrl } from "@/lib/whatsapp";

export default function Footer() {
  const socials = [
    { href: whatsappUrl(), label: "WhatsApp" },
    { href: site.instagramUrl, label: "Instagram" },
    { href: site.tiktokUrl, label: "TikTok" },
  ];

  return (
    <footer className="mt-auto border-t border-line bg-accent-soft/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-heading text-2xl font-semibold">{site.name}</p>
          <p className="mt-2 text-sm text-foreground/75">{site.tagline}</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider">Menu</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-foreground/75 hover:text-accent-strong">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider">Kontak</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/75 hover:text-accent-strong"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-foreground/75">
            Area layanan: {site.serviceAreas.join(", ")}
          </p>
          <p className="mt-1 text-sm text-foreground/75">{site.responseHours}</p>
        </div>
      </div>

      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-foreground/60 sm:px-6">
          © {new Date().getFullYear()} {site.name}. Semua foto digunakan dengan izin klien.
        </p>
      </div>
    </footer>
  );
}
