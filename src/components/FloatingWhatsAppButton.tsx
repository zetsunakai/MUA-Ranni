import { ChatIcon } from "@/components/icons";
import { getProfile } from "@/lib/profile";
import { directWhatsappUrl } from "@/lib/whatsapp";

// Tampil di semua halaman lewat layout.tsx. Di HP hanya ikon, di desktop ikon + teks.
export default async function FloatingWhatsAppButton() {
  const profile = await getProfile();

  return (
    <a
      href={directWhatsappUrl(profile.whatsappNumber)}
      aria-label="Chat WhatsApp"
      className="floating-whatsapp fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex h-14 items-center gap-2 rounded-none bg-foreground px-4 text-white border border-background/30 hover:bg-accent-strong sm:right-6 sm:bottom-6 sm:px-5"
    >
      <ChatIcon className="floating-whatsapp-icon h-6 w-6" />
      <span className="hidden font-medium sm:inline">Chat WhatsApp</span>
    </a>
  );
}
