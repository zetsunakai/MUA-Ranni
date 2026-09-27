// 150000 -> "Rp150.000"
export function formatRupiah(value: number): string {
  return `Rp${value.toLocaleString("id-ID")}`;
}

// 150000 -> "Rp150rb" (untuk layar sempit). Selain kelipatan ribuan, pakai format penuh.
export function formatRupiahShort(value: number): string {
  return value % 1000 === 0 ? `Rp${(value / 1000).toLocaleString("id-ID")}rb` : formatRupiah(value);
}
