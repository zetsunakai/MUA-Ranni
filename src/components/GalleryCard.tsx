import Image from "next/image";
import type { PortfolioItem } from "@/types";

type Props = {
  item: PortfolioItem;
  onOpen: () => void;
  eager?: boolean;
};

export default function GalleryCard({ item, onOpen, eager = false }: Props) {
  return (
    <button type="button" onClick={onOpen} className="lookbook-card group block w-full text-left">
      <div className="relative aspect-[4/5] shrink-0 overflow-hidden bg-accent-soft">
        <Image
          src={item.imageUrl}
          alt={`${item.title}, riasan ${item.categoryLabel}`}
          fill
          // Lookbook: satu kolom di HP, dua kolom mulai 640px.
          // `sizes` memberi tahu browser ukuran tampil supaya tidak mengunduh versi terlalu besar.
          sizes="(min-width: 1152px) 510px, (min-width: 640px) 46vw, 90vw"
          loading={eager ? "eager" : "lazy"}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {item.beforeImageUrl && (
          <span className="absolute top-3 left-3 bg-background/95 px-2.5 py-1 text-[9px] tracking-[0.12em] uppercase">
            Before–After
          </span>
        )}
      </div>
      <p className="lookbook-caption mt-4 flex flex-col gap-2 border-t border-line pt-3">
        <span className="font-heading text-xl leading-snug group-hover:text-accent-strong md:text-2xl">{item.title}</span>
        <span className="text-[10px] tracking-[0.18em] text-muted uppercase">{item.categoryLabel}</span>
      </p>
      {item.description && <p className="mt-3 text-xs leading-relaxed text-muted">{item.description}</p>}
    </button>
  );
}
