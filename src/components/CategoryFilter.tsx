import type { Category, CategoryOption } from "@/types";

export type CategoryFilterValue = Category | "all";

type Props = {
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
  counts: Record<CategoryFilterValue, number>;
  categories: CategoryOption[];
};

// Tidak perlu "use client" sendiri: komponen ini hanya dipakai di dalam
// PortfolioGallery (Client Component), jadi otomatis ikut jalan di browser.
export default function CategoryFilter({ value, onChange, counts, categories }: Props) {
  const options: { value: CategoryFilterValue; label: string }[] = [
    { value: "all", label: "Semua" },
    // Kategori tanpa foto tidak ditampilkan, supaya tidak ada filter yang hasilnya kosong.
    ...categories.filter((c) => (counts[c.id] ?? 0) > 0).map((c) => ({ value: c.id, label: c.label })),
  ];

  return (
    <div
      role="group"
      aria-label="Filter kategori"
      // -mx-4 px-4: chip bisa di-scroll sampai tepi layar HP tanpa terpotong padding.
      className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            aria-label={`${option.label} (${counts[option.value]} foto)`}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
              active
                ? "border-accent-strong bg-accent-strong text-white"
                : "border-line bg-surface hover:border-accent"
            }`}
          >
            {option.label}
            <span aria-hidden="true" className={active ? "ml-1.5 text-white/90" : "ml-1.5 text-foreground/70"}>
              {counts[option.value]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
