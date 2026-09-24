"use client";

// Client Component: menyimpan state filter aktif dan foto yang sedang dibuka.
// Datanya tetap dikirim dari page.tsx (Server Component) lewat props.

import { useState } from "react";
import CategoryFilter, { type CategoryFilterValue } from "@/components/CategoryFilter";
import GalleryCard from "@/components/GalleryCard";
import Lightbox from "@/components/Lightbox";
import { categories } from "@/data/site";
import type { PortfolioItem } from "@/types";

type Props = {
  items: PortfolioItem[];
};

export default function PortfolioGallery({ items }: Props) {
  const [filter, setFilter] = useState<CategoryFilterValue>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const visibleItems = filter === "all" ? items : items.filter((item) => item.category === filter);

  const counts = { all: items.length } as Record<CategoryFilterValue, number>;
  for (const c of categories) counts[c] = items.filter((item) => item.category === c).length;

  return (
    <>
      <CategoryFilter value={filter} onChange={setFilter} counts={counts} />

      <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
        {visibleItems.map((item, index) => (
          <li key={item.id}>
            <GalleryCard item={item} onOpen={() => setOpenIndex(index)} eager={index < 4} />
          </li>
        ))}
      </ul>

      <Lightbox
        items={visibleItems}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </>
  );
}
