import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsAppButton from "@/components/FloatingWhatsAppButton";
import SiteAnalytics from "@/components/SiteAnalytics";
import { site } from "@/data/site";
import "./globals.css";

// Keduanya variable font, jadi tidak perlu set weight.
// `variable` membuat CSS variable yang dipakai di @theme (globals.css).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const description = `${site.tagline} di ${site.serviceAreas.join(", ")}. Lihat portofolio, price list, dan booking via WhatsApp.`;

export const metadata: Metadata = {
  // Dasar untuk mengubah URL relatif (gambar OG, canonical) jadi URL lengkap.
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description,
  // Tampilan saat link dibagikan di WhatsApp, Instagram, Facebook, dll.
  // Gambarnya diambil otomatis dari app/opengraph-image.jpg.
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: site.name,
    title: site.name,
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Navbar />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
        <FloatingWhatsAppButton />
        <SiteAnalytics />
      </body>
    </html>
  );
}
