import FloatingWhatsAppButton from "@/components/FloatingWhatsAppButton";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

// Jaring pengaman: halaman publik dibuat ulang di latar belakang paling lambat tiap 1 jam,
// jadi perubahan data tetap tampil walaupun revalidatePath terlewat (misalnya perubahan
// dilakukan dari admin di laptop). Perubahan dari admin live tetap tampil seketika.
export const revalidate = 3600;

// Layout untuk semua halaman publik. Folder "(site)" adalah route group:
// tanda kurung membuatnya tidak muncul di URL, jadi /layanan tetap /layanan.
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a href="#main-content" className="skip-link">Lewati navigasi</a>
      <Navbar />
      <main id="main-content" className="site-main flex flex-1 flex-col">{children}</main>
      <Footer />
      <FloatingWhatsAppButton />
    </>
  );
}
