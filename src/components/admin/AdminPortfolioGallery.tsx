"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import CategoryFilter, { type CategoryFilterValue } from "@/components/CategoryFilter";
import type { CategoryOption, PortfolioItem } from "@/types";

export default function AdminPortfolioGallery({ items, categories }: { items: PortfolioItem[]; categories: CategoryOption[] }) {
  const [filter, setFilter] = useState<CategoryFilterValue>("all");
  const visible = filter === "all" ? items : items.filter(item => item.category === filter);
  const counts = Object.fromEntries([["all", items.length], ...categories.map(c => [c.id, items.filter(i => i.category === c.id).length])]);
  const showcase = items.find(i => i.beforeImageUrl && i.featured) ?? items.find(i => i.beforeImageUrl);
  return <>
    <CategoryFilter value={filter} onChange={setFilter} counts={counts} categories={categories} />
    <ul className="lookbook-grid admin-lookbook">{visible.map((item, index) => <li key={item.id} className="lookbook-entry lookbook-card">
      <Link href={`/admin/portofolio/${item.id}`} className="group block"><div className="relative aspect-[4/5]"><Image src={item.imageUrl} alt={item.title} fill sizes="(min-width: 1024px) 480px, 90vw" className="object-cover" />
        <div className="absolute inset-x-3 top-3 flex flex-wrap justify-between gap-2"><span className="bg-background/90 px-2 py-1 text-[9px]">0{index + 1}</span>{item.featured && <span className="bg-foreground px-3 py-1 text-[9px] tracking-widest text-white uppercase">Home</span>}</div></div>
        <p className="editorial-label mt-5">{item.categoryLabel}</p><h2 className="mt-2 font-heading text-3xl">{item.title}</h2><p className="editorial-description mt-3">{item.description}</p></Link>
      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-line pt-4"><Link href={`/admin/portofolio/${item.id}`} className="editorial-label">Edit →</Link><Link href="/admin/portofolio/urutan" className="editorial-label">Atur urutan</Link>{item.beforeImageUrl && <span className="ml-auto text-[10px] text-muted">Before–After</span>}</div>
    </li>)}</ul>
    {showcase?.beforeImageUrl && <section className="admin-transformation"><div className="admin-panel-heading"><div><p className="editorial-label">Before &amp; After</p><h2 className="font-heading text-3xl">Lihat bedanya sendiri.</h2></div><Link href={`/admin/portofolio/${showcase.id}`} className="editorial-button editorial-button-outline">Edit</Link></div><div className="transformation-spread"><div className="h-[400px]"><BeforeAfterSlider beforeSrc={showcase.beforeImageUrl} afterSrc={showcase.imageUrl} alt={showcase.title} sizes="(min-width: 1024px) 600px, 90vw" /></div><div><p className="editorial-label">{showcase.categoryLabel}</p><h3 className="mt-4 font-heading text-3xl">{showcase.title}</h3><p className="editorial-description mt-5">{showcase.description}</p><p className="editorial-description mt-5">Geser garis di foto untuk melihat sebelum dan sesudah.</p><Link href={`/admin/portofolio/${showcase.id}`} className="editorial-text-link">Edit →</Link></div></div></section>}
  </>;
}
