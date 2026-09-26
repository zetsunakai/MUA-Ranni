import type { Metadata } from "next";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import SectionHeading from "@/components/SectionHeading";
import { bookingInfo } from "@/data/services";
import { todayInJakarta } from "@/lib/dates";
import { getPublicSchedule, SCHEDULE_MONTHS_AHEAD } from "@/lib/schedule";

export const metadata: Metadata = {
  title: "Jadwal",
  description: "Cek tanggal yang masih kosong dan booking makeup langsung lewat WhatsApp.",
};

// Statis; dibuat ulang saat admin mengubah jadwal (revalidatePath) atau paling lambat tiap jam.
export default async function JadwalPage() {
  const statuses = await getPublicSchedule();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading
        as="h1"
        eyebrow="Jadwal"
        title="Cek tanggal kosong"
        description="Pilih tanggal acaramu, lalu booking lewat WhatsApp. Tanggal baru terkunci setelah DP."
      />
      <div className="mt-8">
        <AvailabilityCalendar statuses={statuses} monthsAhead={SCHEDULE_MONTHS_AHEAD} renderedToday={todayInJakarta()} />
      </div>
      <p className="mt-6 text-sm text-foreground/70">{bookingInfo.deposit}</p>
    </div>
  );
}
