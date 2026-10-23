"use client";

// Client Component: menyimpan state filter aktif, jumlah foto yang tampil, dan foto yang
// sedang dibuka. Datanya tetap dikirim dari page.tsx (Server Component) lewat props.

import { type ReactNode, useState } from "react";
import CategoryFilter, { type CategoryFilterValue } from "@/components/CategoryFilter";
import GalleryCard from "@/components/GalleryCard";
import Lightbox from "@/components/Lightbox";
import type { CategoryOption, PortfolioItem } from "@/types";

type Props = {
  items: PortfolioItem[];
  categories: CategoryOption[];
  // Judul halaman, diikuti baris filter kategori.
  heading: ReactNode;
};

const PAGE_SIZE = 12;

export default function PortfolioGallery({ items, categories, heading }: Props) {
  const [filter, setFilter] = useState<CategoryFilterValue>("all");
  const [shown, setShown] = useState(PAGE_SIZE);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredItems = filter === "all" ? items : items.filter((item) => item.category === filter);
  const visibleItems = filteredItems.slice(0, shown);

  const counts = { all: items.length } as Record<CategoryFilterValue, number>;
  for (const c of categories) counts[c.id] = items.filter((item) => item.category === c.id).length;

  function changeFilter(value: CategoryFilterValue) {
    setFilter(value);
    setShown(PAGE_SIZE);
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        {/* Dibungkus sendiri: elemen dari Server Component yang dirender berdampingan
            dengan elemen lain memicu peringatan "key" React di mode dev. */}
        <div className="portfolio-intro">{heading}</div>
        <CategoryFilter value={filter} onChange={changeFilter} counts={counts} categories={categories} />
      </div>

      {/* Grid per baris menjaga urutan foto; ukuran dan offset mengikuti komposisi lookbook. */}
      <ul className="lookbook-grid">
        {visibleItems.map((item, index) => (
          <li key={item.id} className="lookbook-entry">
            <GalleryCard item={item} onOpen={() => setOpenIndex(index)} eager={index < 4} />
          </li>
        ))}
      </ul>

      {filteredItems.length > shown && (
        <div className="mt-8 flex justify-center md:mt-14">
          <button
            type="button"
            onClick={() => setShown((n) => n + PAGE_SIZE)}
            className="w-full rounded-none border border-foreground px-8 py-4 font-medium transition-colors hover:bg-foreground hover:text-background md:w-auto"
          >
            Muat lebih banyak
          </button>
        </div>
      )}

      <Lightbox
        items={visibleItems}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </>
  );
}
