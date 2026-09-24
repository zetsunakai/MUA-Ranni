"use client";

// Client Component karena butuh state (menu HP buka/tutup) dan usePathname (link aktif).

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navLinks, site } from "@/data/site";
import { whatsappUrl } from "@/lib/whatsapp";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/95 backdrop-blur">
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
      >
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="font-heading text-2xl font-semibold tracking-tight"
        >
          {site.name}
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          <ul className="flex items-center gap-6 text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={
                    isActive(link.href)
                      ? "font-medium text-accent-strong"
                      : "text-foreground/80 transition-colors hover:text-accent-strong"
                  }
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
            className="rounded-full bg-accent-strong px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-foreground"
          >
            Chat WhatsApp
          </a>
        </div>

        {/* Tombol menu HP */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          className="-mr-2 rounded-lg p-2 md:hidden"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {/* Menu HP */}
      {open && (
        <div id="mobile-menu" className="border-t border-line bg-background md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`block border-b border-line py-3 text-base ${
                    isActive(link.href) ? "font-medium text-accent-strong" : ""
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="px-4 pb-4 pt-2">
            <a
              href={whatsappUrl("navbar")}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-full bg-accent-strong py-3 text-center font-medium text-white"
            >
              Chat WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
