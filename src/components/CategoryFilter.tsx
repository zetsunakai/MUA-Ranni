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
      // HP: satu baris yang bisa di-scroll sampai tepi layar (-mx-5 px-5).
      // Desktop: rata kanan dan boleh turun baris, sejajar judul halaman.
      className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 sm:-mx-6 sm:px-6 md:mx-0 md:max-w-[460px] md:shrink-0 md:flex-wrap md:justify-end md:gap-2.5 md:px-0"
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
            className={`shrink-0 rounded-full border px-[18px] py-3 text-sm transition-colors md:px-[22px] md:text-[15px] ${
              active
                ? "border-foreground bg-foreground text-background"
                : "border-sand hover:border-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
