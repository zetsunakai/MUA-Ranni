import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // next/image hanya mau mengoptimasi gambar remote dari host yang didaftarkan di sini.
    // `search` sengaja tidak diisi supaya query Unsplash (?w=...&sat=...) diizinkan.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-**",
      },
    ],
  },
};

export default nextConfig;
