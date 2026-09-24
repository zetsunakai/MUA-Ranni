import type { MetadataRoute } from "next";
import { site } from "@/data/site";

// Jadi /robots.txt: semua halaman boleh diindeks, dan memberi tahu lokasi sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
