import type { Metadata } from "next";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { bookingInfo } from "@/data/services";
import { getCategories } from "@/lib/categories";
import { todayInJakarta } from "@/lib/dates";
import { getPublicSchedule, SCHEDULE_MONTHS_AHEAD } from "@/lib/schedule";

export const metadata: Metadata = {
  title: "Jadwal",
  description: "Cek tanggal yang masih kosong dan booking makeup langsung lewat WhatsApp.",
};

// Statis; dibuat ulang saat admin mengubah jadwal (revalidatePath) atau paling lambat tiap jam.
export default async function JadwalPage() {
  const [statuses, categories] = await Promise.all([getPublicSchedule(), getCategories()]);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-14 sm:px-6 md:pt-24 md:pb-28">
      <div className="max-w-4xl">
        <p className="text-xs font-semibold tracking-[0.25em] text-accent-strong uppercase">Jadwal</p>
        <h1 className="mt-4 font-heading text-[56px] leading-[0.95] tracking-tight md:mt-5 md:text-8xl">
          Cek tanggalmu, <em>kunci lebih awal.</em>
        </h1>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted md:mt-5 md:text-lg">
          Musim wisuda dan nikah cepat penuh. Lihat tanggal yang masih tersedia, lalu kirim detail acaramu lewat
          WhatsApp.
        </p>
      </div>

      <div className="mt-6 md:mt-16">
        <AvailabilityCalendar
          statuses={statuses}
          monthsAhead={SCHEDULE_MONTHS_AHEAD}
          renderedToday={todayInJakarta()}
          eventTypes={categories}
          footnote={`Tanggal yang tampil tersedia tetap dikonfirmasi lewat WhatsApp sebelum dianggap terkunci. ${bookingInfo.deposit}`}
        />
      </div>
    </div>
  );
}
