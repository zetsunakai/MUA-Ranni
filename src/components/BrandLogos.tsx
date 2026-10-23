import Image from "next/image";
import type { Brand } from "@/types";

// Logo punya bentuk berbeda-beda: MAYBELLINE panjang tipis, LT Pro hampir kotak.
// Kalau disamakan tingginya, logo panjang jadi terlalu dominan; kalau disamakan
// lebarnya, logo kotak jadi raksasa. Jadi lebar tampil dihitung dari akar rasio
// (lebar/tinggi), supaya "luas" setiap logo kira-kira sama di mata.
function displayWidthPercent(brand: Brand): number {
  const ratio = brand.width / brand.height;
  return Math.min(92, 50 * Math.sqrt(ratio));
}

export default function BrandLogos({ brands }: { brands: Brand[] }) {
  return (
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
      {brands.map((brand) => (
        <li
          key={brand.name}
          className="flex aspect-[3/2] items-center justify-center rounded-none border border-line bg-white p-3"
        >
          <Image
            src={brand.logo}
            alt={brand.name}
            width={brand.width}
            height={brand.height}
            // File logo sudah kecil (1–5 KB), jadi tidak perlu dioptimasi ulang.
            unoptimized
            className="h-auto max-h-full rounded-none object-contain"
            style={{ width: `${displayWidthPercent(brand)}%` }}
          />
        </li>
      ))}
    </ul>
  );
}
