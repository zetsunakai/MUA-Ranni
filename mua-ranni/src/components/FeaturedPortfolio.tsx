import Image from "next/image";
import Link from "next/link";
import { categoryLabels } from "@/data/site";
import type { PortfolioItem } from "@/types";

// Versi ringkas galeri untuk Home: tanpa filter dan lightbox,
// setiap foto langsung mengarah ke halaman Portofolio.
export default function FeaturedPortfolio({ items }: { items: PortfolioItem[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-5">
      {items.map((item) => (
        <li key={item.id}>
          <Link href="/portfolio" className="group block rounded-xl">
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-accent-soft">
              <Image
                src={item.imageUrl}
                alt={`${item.title}, riasan ${categoryLabels[item.category]}`}
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute bottom-2 left-2 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-medium">
                {categoryLabels[item.category]}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
