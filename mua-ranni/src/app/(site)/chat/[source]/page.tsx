import type { Metadata } from "next";
import WhatsAppRedirect from "@/components/WhatsAppRedirect";
import { getProfile } from "@/lib/profile";
import { WHATSAPP_SOURCES } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Membuka WhatsApp",
  robots: { index: false, follow: false },
};

// Satu halaman statis per tombol: /chat/hero, /chat/layanan, dst.
// Source di luar daftar -> 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return WHATSAPP_SOURCES.map((source) => ({ source }));
}

export default async function ChatPage() {
  const profile = await getProfile();
  return <WhatsAppRedirect number={profile.whatsappNumber} />;
}
