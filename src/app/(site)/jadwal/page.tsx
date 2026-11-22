import type { Metadata } from "next";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { BookingCTA } from "@/components/editorial/Editorial";
import { todayInJakarta } from "@/lib/dates";
import { getProfile } from "@/lib/profile";
import { getPublicSchedule, SCHEDULE_MONTHS_AHEAD } from "@/lib/schedule";

export const metadata: Metadata = { title: "Jadwal", description: "Cek tanggal yang masih kosong dan booking makeup langsung lewat WhatsApp.", alternates: { canonical: "/jadwal" } };
export default async function JadwalPage() {
  const [statuses, profile] = await Promise.all([getPublicSchedule(), getProfile()]);
  return <>
    <section className="contact-opening product-band"><div className="editorial-container"><div><h1 className="editorial-display">Cek tanggalmu,<br /><em>kunci lebih awal.</em></h1></div><div className="response-card"><p className="font-heading">Kunci tanggal</p><p className="editorial-description mt-4">{profile.depositInfo}</p></div></div></section>
    <section className="editorial-container editorial-section"><AvailabilityCalendar statuses={statuses} monthsAhead={SCHEDULE_MONTHS_AHEAD} renderedToday={todayInJakarta()} footnote={`Tanggal yang tampil tersedia tetap dikonfirmasi lewat WhatsApp sebelum dianggap terkunci. ${profile.depositInfo}`} /></section>
    <BookingCTA compact />
  </>;
}
