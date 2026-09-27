import Image from "next/image";
import type { PortfolioItem } from "@/types";

type Props = {
  item: PortfolioItem;
  // Urutan di grid, dipakai untuk memilih rasio foto.
  index: number;
  onOpen: () => void;
  eager?: boolean;
};

// Rasio bergiliran supaya grid masonry terlihat bervariasi seperti di desain.
// Polanya 7 langkah (bukan kelipatan 2 atau 3) supaya kolom tidak terlihat berulang.
const ASPECTS = ["aspect-[4/5]", "aspect-[5/6]", "aspect-[3/4]", "aspect-[1/1]", "aspect-[2/3]", "aspect-[4/5]", "aspect-[5/6]"];

export default function GalleryCard({ item, index, onOpen, eager = false }: Props) {
  return (
    <button type="button" onClick={onOpen} className="group block w-full text-left">
      <div className={`relative overflow-hidden rounded-sm bg-accent-soft ${ASPECTS[index % ASPECTS.length]}`}>
        <Image
          src={item.imageUrl}
          alt={`${item.title}, riasan ${item.categoryLabel}`}
          fill
          // Grid: 2 kolom di HP, 3 kolom mulai tablet (maksimal ±380px di layar lebar).
          // `sizes` memberi tahu browser ukuran tampil supaya tidak mengunduh versi terlalu besar.
          sizes="(min-width: 1152px) 380px, (min-width: 768px) 33vw, 50vw"
          loading={eager ? "eager" : "lazy"}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {item.beforeImageUrl && (
          <span className="absolute top-2 left-2 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-medium">
            Before–After
          </span>
        )}
      </div>
      <p className="mt-2 flex items-baseline justify-between gap-3 text-[13px] md:mt-3 md:text-sm">
        <span className="font-medium leading-snug group-hover:text-accent-strong">{item.title}</span>
        <span className="hidden shrink-0 text-muted md:inline">{item.categoryLabel}</span>
      </p>
    </button>
  );
}
