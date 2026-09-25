import FloatingWhatsAppButton from "@/components/FloatingWhatsAppButton";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

// Layout untuk semua halaman publik. Folder "(site)" adalah route group:
// tanda kurung membuatnya tidak muncul di URL, jadi /layanan tetap /layanan.
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
      <FloatingWhatsAppButton />
    </>
  );
}
