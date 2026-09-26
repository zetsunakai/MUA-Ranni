import type { MetadataRoute } from "next";
import { site } from "@/data/site";

// Jadi /robots.txt: semua halaman boleh diindeks kecuali /chat (halaman perantara
// tombol WhatsApp) dan /admin, dan memberi tahu lokasi sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/chat/", "/admin", "/testimoni/"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
