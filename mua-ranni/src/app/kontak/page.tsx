import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import { ChatIcon, ClockIcon, InstagramIcon, PinIcon } from "@/components/icons";
import { bookingInfo } from "@/data/services";
import { site } from "@/data/site";
import { whatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Kontak",
  description: `Booking ${site.name} lewat WhatsApp ${site.whatsappDisplay}. Area layanan ${site.serviceAreas.join(", ")}.`,
};

const bookingSteps = [
  "Chat WhatsApp: kirim tanggal, jam, lokasi, dan jenis makeup.",
  bookingInfo.deposit,
  bookingInfo.payment,
];

export default function KontakPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading
        as="h1"
        eyebrow="Kontak"
        title="Booking & tanya jadwal"
        description="Cara tercepat adalah lewat WhatsApp. Sertakan tanggal dan lokasi acara supaya bisa langsung dicek jadwalnya."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <a
          href={whatsappUrl("kontak")}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-xl bg-accent-strong p-5 text-white transition-colors hover:bg-foreground sm:p-6"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15">
            <ChatIcon className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-sm text-white/90">WhatsApp</span>
            <span className="block text-lg font-semibold">{site.whatsappDisplay}</span>
          </span>
        </a>

        <a
          href={site.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent sm:p-6"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
            <InstagramIcon className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-sm text-foreground/70">Instagram</span>
            <span className="block text-lg font-semibold">{site.instagramHandle}</span>
          </span>
        </a>

        <div className="flex items-center gap-4 rounded-xl border border-line bg-surface p-5 sm:p-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
            <PinIcon className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-sm text-foreground/70">Area layanan</span>
            <span className="block font-semibold">{site.serviceAreas.join(", ")}</span>
          </span>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-line bg-surface p-5 sm:p-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
            <ClockIcon className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-sm text-foreground/70">Jam respon chat</span>
            <span className="block font-semibold">{site.responseHours}</span>
          </span>
        </div>
      </div>

      <section aria-labelledby="cara-booking" className="mt-12">
        <h2 id="cara-booking" className="font-heading text-2xl font-semibold">
          Cara booking
        </h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-3">
          {bookingSteps.map((step, i) => (
            <li key={step} className="flex gap-3 rounded-xl border border-line bg-surface p-5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-strong">
                {i + 1}
              </span>
              <span className="text-sm text-foreground/80">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
