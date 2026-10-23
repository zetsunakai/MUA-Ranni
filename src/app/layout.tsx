import type { Metadata } from "next";
import { Bodoni_Moda, Hanken_Grotesk } from "next/font/google";
import SiteAnalytics from "@/components/SiteAnalytics";
import { site } from "@/data/site";
import "./globals.css";

// Font editorial dimuat dan di-host oleh Next.js.
const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni-moda",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

// Global SEO must also render for admin and error pages during a database outage.
export function generateMetadata(): Metadata {
  const description = `${site.tagline}. Lihat portofolio, price list, dan booking via WhatsApp.`;
  return {
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
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: Chrome di iPhone menyisipkan atribut sendiri ke <html>
    // (__gcrremoteframetoken) sebelum React jalan. Hanya berlaku untuk atribut <html> ini,
    // mismatch di elemen lain tetap dilaporkan.
    <html lang="id" className={`${hankenGrotesk.variable} ${bodoniModa.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans">
        {/* Navbar, footer, dan tombol WA ada di app/(site)/layout.tsx,
            jadi tidak ikut tampil di halaman admin. */}
        {children}
        <SiteAnalytics />
      </body>
    </html>
  );
}
