// Label kategori belanja (aman untuk browser).
export type ExpenseCategory = "bahan" | "alat" | "lainnya";

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  bahan: "Bahan makeup",
  alat: "Alat",
  lainnya: "Lainnya",
};
