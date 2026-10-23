import type { Metadata } from "next";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { BookingCTA } from "@/components/editorial/Editorial";
import { bookingInfo } from "@/data/services";
import { todayInJakarta } from "@/lib/dates";
import { getPublicSchedule, SCHEDULE_MONTHS_AHEAD } from "@/lib/schedule";

export const metadata: Metadata = { title: "Jadwal", description: "Cek tanggal yang masih kosong dan booking makeup langsung lewat WhatsApp.", alternates: { canonical: "/jadwal" } };
export default async function JadwalPage() {
  const statuses = await getPublicSchedule();
  return <>
    <section className="contact-opening product-band"><div className="editorial-container"><div><p className="editorial-label">Jadwal</p><h1 className="editorial-display">Cek tanggalmu,<br /><em>kunci lebih awal.</em></h1><p className="editorial-description mt-6">Musim wisuda dan nikah cepat penuh. Lihat tanggal yang masih tersedia, lalu kirim detail acaramu lewat WhatsApp.</p></div><div className="response-card"><p className="editorial-label">Sebelum booking</p><p className="font-heading">Kunci tanggal</p><p className="editorial-description mt-4">{bookingInfo.deposit}</p></div></div></section>
    <section className="editorial-container editorial-section"><AvailabilityCalendar statuses={statuses} monthsAhead={SCHEDULE_MONTHS_AHEAD} renderedToday={todayInJakarta()} footnote={`Tanggal yang tampil tersedia tetap dikonfirmasi lewat WhatsApp sebelum dianggap terkunci. ${bookingInfo.deposit}`} /></section>
    <BookingCTA compact />
  </>;
}
