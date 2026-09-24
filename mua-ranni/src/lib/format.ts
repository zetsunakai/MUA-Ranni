// 150000 -> "Rp150.000"
export function formatRupiah(value: number): string {
  return `Rp${value.toLocaleString("id-ID")}`;
}
