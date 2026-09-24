import Image from "next/image";
import { categoryLabels } from "@/data/site";
import type { PortfolioItem } from "@/types";

type Props = {
  item: PortfolioItem;
  onOpen: () => void;
  eager?: boolean;
};

export default function GalleryCard({ item, onOpen, eager = false }: Props) {
  return (
    <button type="button" onClick={onOpen} className="group block w-full rounded-xl text-left">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-accent-soft">
        <Image
          src={item.imageUrl}
          alt={`${item.title}, riasan ${categoryLabels[item.category]}`}
          fill
          // Grid: 2 kolom di HP, 3 di tablet, 4 di desktop. `sizes` memberi tahu browser
          // ukuran tampil gambar supaya tidak mengunduh versi yang terlalu besar.
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          loading={eager ? "eager" : "lazy"}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {item.beforeImageUrl && (
          <span className="absolute left-2 top-2 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-medium">
            Before–After
          </span>
        )}
      </div>
      <p className="mt-2 text-sm font-medium leading-snug group-hover:text-accent-strong">{item.title}</p>
      <p className="text-xs text-foreground/60">{categoryLabels[item.category]}</p>
    </button>
  );
}
