"use client";

// Client Component karena butuh state (menu HP buka/tutup) dan usePathname (link aktif).

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navLinks } from "@/data/site";
import { whatsappUrl } from "@/lib/whatsapp";

// Logo teks dua baris sesuai desain: "Ranni Tary" (serif) + "MAKEUP ARTIST" (huruf kecil berjarak).
function Wordmark() {
  return (
    <span className="flex flex-col leading-none">
      <span className="font-heading text-[28px] tracking-tight sm:text-3xl">Ranni Tary</span>
      <span className="mt-1 text-[9px] font-medium tracking-[0.35em] sm:text-[10px]">MAKEUP ARTIST</span>
    </span>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/95 backdrop-blur">
      <nav aria-label="Navigasi utama" className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:h-20 sm:px-6">
        <Link href="/" onClick={() => setOpen(false)} aria-label="Ranni Tary Makeup, ke beranda">
          <Wordmark />
        </Link>

        {/* Desktop */}
        <ul className="hidden items-center gap-9 text-[15px] md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={isActive(link.href) ? "text-accent-strong" : "transition-colors hover:text-accent-strong"}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <a
          href={whatsappUrl("navbar")}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-full bg-accent-strong px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-foreground md:inline-block"
        >
          Chat WhatsApp
        </a>

        {/* Tombol menu HP: lingkaran bergaris sesuai desain */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-foreground/80 md:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M6 9h12M6 15h12" />}
          </svg>
        </button>
      </nav>

      {/* Menu HP */}
      {open && (
        <div id="mobile-menu" className="border-t border-line bg-background md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col px-5 py-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`block border-b border-line py-3.5 font-heading text-2xl ${isActive(link.href) ? "text-accent-strong" : ""}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="px-5 pt-3 pb-5">
            <a
              href={whatsappUrl("navbar")}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-full bg-accent-strong py-3.5 text-center font-medium text-white"
            >
              Chat WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
