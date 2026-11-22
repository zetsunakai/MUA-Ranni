// Hitungan booking yang dipakai bersama oleh server dan form admin (aman untuk browser).

export type BookingStatus = "estimasi" | "confirmed" | "selesai" | "batal";
export type PaymentKind = "dp" | "pelunasan" | "lainnya";
export type PaymentMethod = "bca" | "seabank" | "cash" | "lainnya";

export const STATUS_LABELS: Record<BookingStatus, string> = {
  estimasi: "Estimasi",
  confirmed: "Confirmed",
  selesai: "Selesai",
  batal: "Batal",
};

export const PAYMENT_KIND_LABELS: Record<PaymentKind, string> = {
  dp: "DP",
  pelunasan: "Pelunasan",
  lainnya: "Lainnya",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bca: "BCA",
  seabank: "SeaBank",
  cash: "Cash",
  lainnya: "Lainnya",
};

// DP situasional; ini hanya isian awal di form pembayaran pertama.
export const DEFAULT_DP = 50_000;

export type LineInput = { qty: number; unitPrice: number };

export function bookingTotals(lines: LineInput[], transportFee: number, discount: number, paid = 0) {
  const subtotal = lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);
  const total = Math.max(0, subtotal + transportFee - discount);
  return { subtotal, total, paid, balance: total - paid };
}

export type PaymentStatus = "belum" | "dp" | "lunas" | "lebih";

export function paymentStatus(total: number, paid: number): PaymentStatus {
  if (paid <= 0) return total === 0 ? "lunas" : "belum";
  if (paid < total) return "dp";
  return paid === total ? "lunas" : "lebih";
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  belum: "Belum bayar",
  dp: "Sudah DP",
  lunas: "Lunas",
  lebih: "Lebih bayar",
};
