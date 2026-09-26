import type { Metadata } from "next";
import TestimonialForm from "@/components/TestimonialForm";
import { site } from "@/data/site";
import { checkInvite } from "@/lib/testimonials";
import { whatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Tulis testimoni",
  robots: { index: false, follow: false },
};

const reasons = {
  "not-found": "Link ini tidak ditemukan. Pastikan link yang dibuka sama persis dengan yang dikirim Ranni.",
  used: "Link ini sudah dipakai untuk mengirim testimoni. Terima kasih! 💕",
  expired: "Link ini sudah kedaluwarsa. Minta link baru ke Ranni ya.",
};

// Halaman dinamis: setiap link undangan dicek ke database saat dibuka.
export default async function TestimoniPage({ params }: PageProps<"/testimoni/[token]">) {
  const { token } = await params;
  const check = await checkInvite(token);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">Testimoni</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">
        {check.ok ? `Halo ${check.invite.clientName}, gimana hasil makeup-nya?` : "Link tidak bisa dipakai"}
      </h1>

      {check.ok ? (
        <>
          <p className="mt-3 text-foreground/75">
            Ceritakan pengalamanmu dirias {site.name}. Ulasanmu akan tampil di website setelah dicek Ranni.
          </p>
          <div className="mt-8">
            <TestimonialForm token={check.invite.id} clientName={check.invite.clientName} eventType={check.invite.eventType} />
          </div>
        </>
      ) : (
        <div className="mt-4 space-y-5">
          <p className="text-foreground/75">{reasons[check.reason]}</p>
          <a
            href={whatsappUrl("kontak", "Halo Kak, saya mau kirim testimoni tapi link-nya tidak bisa dibuka.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-accent-strong px-6 py-3 font-medium text-white"
          >
            Chat Ranni
          </a>
        </div>
      )}
    </div>
  );
}
