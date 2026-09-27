import { redirect } from "next/navigation";

// Alamat lama; halaman harga sekarang bagian dari /admin/layanan.
export default function HargaRedirect() {
  redirect("/admin/layanan");
}
