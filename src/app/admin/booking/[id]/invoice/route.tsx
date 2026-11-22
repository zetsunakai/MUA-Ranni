import { getAdmin } from "@/lib/auth";
import { getBooking } from "@/lib/bookings";
import { renderInvoiceImage } from "@/lib/invoice-image";
import { getProfile } from "@/lib/profile";

// PNG invoice untuk admin (tampil di detail booking, lalu dibagikan/di-download).
export async function GET(_request: Request, { params }: RouteContext<"/admin/booking/[id]/invoice">) {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const [data, profile] = await Promise.all([getBooking(id), getProfile()]);
  if (!data) return new Response("Not found", { status: 404 });
  const { booking, lines, payments, totals } = data;
  const { invoiceNumber, invoiceIssuedAt } = booking;
  if (!invoiceNumber || !invoiceIssuedAt) return new Response("Invoice belum dibuat", { status: 409 });

  return renderInvoiceImage(
    { booking: { ...booking, invoiceNumber, invoiceIssuedAt }, lines, payments, totals, contact: profile },
    { "Cache-Control": "private, no-store", "Content-Disposition": `inline; filename="${invoiceNumber}.png"` },
  );
}
