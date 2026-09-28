import type { NextConfig } from "next";

// Host Supabase Storage (foto portofolio yang di-upload lewat admin).
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  // Supaya HP di Wi-Fi yang sama bisa membuka dev server lewat IP laptop (http://192.168.1.27:3000)
  // tanpa diblokir. Hanya berlaku saat `next dev`. Ganti kalau IP laptop berubah.
  allowedDevOrigins: ["192.168.1.27"],
  images: {
    // next/image hanya mau mengoptimasi gambar remote dari host yang didaftarkan di sini.
    // `search` sengaja tidak diisi supaya query Unsplash (?w=...&sat=...) diizinkan.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-**",
      },
      ...(supabaseHost
        ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : []),
    ],
  },
  experimental: {
    // Batas upload lewat Server Action (bawaan 1 MB). Foto sudah dikompres di browser
    // jadi biasanya < 500 KB; 4 MB untuk jaga-jaga, di bawah batas Vercel 4,5 MB.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
