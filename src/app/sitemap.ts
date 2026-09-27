import type { MetadataRoute } from "next";
import { navLinks, site } from "@/data/site";

// Dibuat otomatis jadi /sitemap.xml saat build. Google membaca file ini
// untuk tahu halaman apa saja yang ada di website.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [{ href: "/" }, ...navLinks];
  return pages.map(({ href }) => ({
    url: `${site.url}${href === "/" ? "" : href}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: href === "/" ? 1 : 0.8,
  }));
}
