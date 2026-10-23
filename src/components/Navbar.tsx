"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navLinks } from "@/data/site";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  function links(start: number, end: number) {
    return navLinks.slice(start, end).map((link) => (
      <li key={link.href}>
        <Link prefetch={true} href={link.href} aria-current={isActive(link.href) ? "page" : undefined}
          className={`nav-link ${isActive(link.href) ? "nav-link-active" : ""}`}>
          {link.label}
        </Link>
      </li>
    ));
  }

  return (
    <header className="site-header sticky top-0 z-40 border-b border-line bg-background/95 backdrop-blur-md">
      <nav aria-label="Navigasi utama" className="editorial-container relative flex min-h-22 items-center justify-between gap-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:py-5">
        <ul className="hidden items-center gap-6 lg:flex xl:gap-8">{links(0, 3)}</ul>
        <Link prefetch={true} href="/" onClick={() => setOpen(false)} aria-label="Ranni Tary Makeup, ke beranda" className="flex shrink-0 flex-col lg:items-center">
          <span className="font-heading text-[30px] leading-none tracking-[-0.03em] uppercase sm:text-[36px]">Ranni Tary</span>
          <span className="mt-2 text-[9px] tracking-[0.35em] text-muted">MAKEUP ARTIST</span>
        </Link>
        <ul className="hidden items-center justify-end gap-6 lg:flex xl:gap-8">{links(3, 6)}</ul>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-menu"
          aria-label={open ? "Tutup menu" : "Buka menu"} className="flex h-11 w-11 items-center justify-center border border-line lg:hidden">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
          </svg>
        </button>
      </nav>
      {open && (
        <div id="mobile-menu" className="absolute inset-x-0 border-y border-line bg-background lg:hidden">
          <ul className="editorial-container py-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link prefetch={true} href={link.href} onClick={() => setOpen(false)} aria-current={isActive(link.href) ? "page" : undefined}
                  className={`block border-b border-line py-3.5 font-heading text-2xl ${isActive(link.href) ? "text-accent-strong" : ""}`}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
