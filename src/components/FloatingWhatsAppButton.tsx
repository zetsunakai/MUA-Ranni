import { ChatIcon } from "@/components/icons";
import { bookingFormUrl } from "@/lib/whatsapp";

// Tampil di semua halaman lewat layout.tsx. Di HP hanya ikon, di desktop ikon + teks.
export default function FloatingWhatsAppButton() {
  return (
    <a
      href={bookingFormUrl("floating")}
      aria-label="Chat WhatsApp"
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex h-14 items-center gap-2 rounded-full bg-accent-strong px-4 text-white shadow-lg shadow-foreground/20 transition-colors hover:bg-foreground sm:right-6 sm:bottom-6 sm:px-5"
    >
      <ChatIcon className="h-6 w-6" />
      <span className="hidden font-medium sm:inline">Chat WhatsApp</span>
    </a>
  );
}
