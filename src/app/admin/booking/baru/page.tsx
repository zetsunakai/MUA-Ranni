import type { Metadata } from "next";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import BookingEditor from "@/components/admin/BookingEditor";
import { requireAdmin } from "@/lib/auth";
import { getBookingFormOptions } from "@/lib/booking-catalog";

export const metadata: Metadata = { title: "Booking baru" };

export default async function NewBookingPage() {
  const admin = await requireAdmin();
  const { catalog, eventTypes } = await getBookingFormOptions();

  return (
    <>
      <AdminHeader email={admin.email} current="/admin/booking" />
      <div className="admin-content mx-auto w-full max-w-3xl px-4 py-6">
        <Link href="/admin/booking" className="text-sm text-accent-strong">← Kembali</Link>
        <div className="mt-2">
          <h1 className="font-heading text-4xl">Booking baru</h1>
        </div>
        <div className="mt-6">
          <BookingEditor
            catalog={catalog}
            eventTypes={eventTypes}
            draft={{ clientName: "", clientPhone: "", eventType: "", eventDate: "", makeupTime: "", location: "", mapsUrl: "", people: "", hairdo: "", note: "", transportFee: 0, discount: 0, lines: [] }}
          />
        </div>
      </div>
    </>
  );
}
