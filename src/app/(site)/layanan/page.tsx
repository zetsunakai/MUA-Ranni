import type { Metadata } from "next";
import ServicesContent from "@/components/editorial/ServicesContent";

export const metadata: Metadata = {
  title: "Layanan & Harga",
  description: "Price list 2026 makeup wisuda, pagar ayu, pesta, lamaran, siraman, pengajian, dan akad. Harga per orang, termasuk bulu mata dan hijab do.",
  alternates: { canonical: "/layanan" },
};

export default function LayananPage() {
  return <ServicesContent />;
}
