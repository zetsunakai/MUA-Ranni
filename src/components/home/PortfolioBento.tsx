"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { CategoryOption, PortfolioItem } from "@/types";

type Props = { items: PortfolioItem[]; categories: CategoryOption[] };

// Bento: 1 foto besar + 4 foto kecil. Chip memfilter semua foto portofolio;
// "Semua" menampilkan foto pilihan (featured) lebih dulu.
export default function PortfolioBento({ items, categories }: Props) {
  const [filter, setFilter] = useState("all");
  const withPhotos = categories.filter((c) => items.some((i) => i.category === c.id));
  const pool = filter === "all" ? items : items.filter((i) => i.category === filter);
  const shown = [...pool].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 5);
  const [big, ...small] = shown;

  return (
    <div>
      <div role="group" aria-label="Filter kategori" className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:justify-end md:px-0">
        {[{ id: "all", label: "Semua" }, ...withPhotos].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilter(c.id)}
            aria-pressed={filter === c.id}
            className={`shrink-0 rounded-full border px-5 py-2.5 text-[15px] transition-colors ${
              filter === c.id ? "border-foreground bg-foreground text-background" : "border-foreground/30 hover:border-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {big && (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Tile item={big} index={0} large />
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:gap-x-6">
            {small.map((item, i) => (
              <Tile key={item.id} item={item} index={i + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Tile({ item, index, large = false }: { item: PortfolioItem; index: number; large?: boolean }) {
  return (
    <Link href="/portfolio" className="group block">
      <div className={`relative overflow-hidden rounded bg-sand ${large ? "aspect-[4/5] md:aspect-[62/70]" : "aspect-square"}`}>
        <Image
          src={item.imageUrl}
          alt={`${item.title}, riasan ${item.categoryLabel}`}
          fill
          sizes={large ? "(min-width: 768px) 45vw, 100vw" : "(min-width: 768px) 22vw, 50vw"}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <p className="mt-3 flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">
          {String(index + 1).padStart(2, "0")} · {item.title}
        </span>
        <span className="shrink-0 text-muted">{item.categoryLabel}</span>
      </p>
    </Link>
  );
}
