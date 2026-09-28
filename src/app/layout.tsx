import type { Metadata } from "next";
import { DM_Sans, Newsreader } from "next/font/google";
import SiteAnalytics from "@/components/SiteAnalytics";
import { site } from "@/data/site";
import { getProfile } from "@/lib/profile";
import "./globals.css";

// DM Sans: variable font (semua ketebalan). Newsreader: serif editorial yang dirancang untuk
// dibaca di layar, variable font dengan italic untuk kata penekanan di judul.
// `variable` dipakai di @theme (globals.css).
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const description = `${site.tagline} di ${profile.serviceAreas.join(", ")}. Lihat portofolio, price list, dan booking via WhatsApp.`;
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
    <html lang="id" className={`${dmSans.variable} ${newsreader.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans">
        {/* Navbar, footer, dan tombol WA ada di app/(site)/layout.tsx,
            jadi tidak ikut tampil di halaman admin. */}
        {children}
        <SiteAnalytics />
      </body>
    </html>
  );
}
