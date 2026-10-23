"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { CategoryOption, PortfolioItem } from "@/types";

type Props = { items: PortfolioItem[]; categories: CategoryOption[] };

// Empat foto dalam grid seragam. Filter berlaku untuk semua portofolio;
// "Semua" menampilkan foto pilihan (featured) lebih dulu.
export default function LookbookPreview({ items, categories }: Props) {
  const [filter, setFilter] = useState("all");
  const withPhotos = categories.filter((c) => items.some((i) => i.category === c.id));
  const pool = filter === "all" ? items : items.filter((i) => i.category === filter);
  const shown = [...pool].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 4);

  return (
    <div>
      <div role="group" aria-label="Filter kategori" className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
        {[{ id: "all", label: "Semua" }, ...withPhotos].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilter(c.id)}
            aria-pressed={filter === c.id}
            className={`shrink-0 rounded-none border px-5 py-2.5 text-[10px] tracking-[0.14em] uppercase transition-colors ${
              filter === c.id ? "border-foreground bg-foreground text-background" : "border-foreground/30 hover:border-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="lookbook-grid lookbook-preview">
        {shown.map((item, index) => <Tile key={item.id} item={item} index={index} />)}
      </div>
    </div>
  );
}

function Tile({ item, index }: { item: PortfolioItem; index: number }) {
  return (
    <Link href="/portfolio" className="lookbook-entry lookbook-card group block">
      <div className="relative aspect-[4/5] shrink-0 overflow-hidden bg-sand">
        <Image
          src={item.imageUrl}
          alt={`${item.title}, riasan ${item.categoryLabel}`}
          fill
          sizes="(min-width: 1152px) 530px, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <p className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
        <span className="font-heading text-lg leading-tight">
          {String(index + 1).padStart(2, "0")} · {item.title}
        </span>
        <span className="text-[9px] tracking-[0.12em] text-muted uppercase">{item.categoryLabel}</span>
      </p>
    </Link>
  );
}
