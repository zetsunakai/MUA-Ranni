"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  beforeSrc: string;
  afterSrc: string;
  alt: string;
  sizes: string;
};

// Foto "sesudah" di bawah, foto "sebelum" di atasnya dipotong dengan clip-path.
// Input range transparan menutupi seluruh area, jadi bisa digeser dengan jari,
// mouse, atau tombol panah keyboard tanpa kode drag sendiri.
export default function BeforeAfterSlider({ beforeSrc, afterSrc, alt, sizes }: Props) {
  const [position, setPosition] = useState(50);
  // Rasio foto dibaca saat foto selesai dimuat. Kotak slider dibuat seukuran foto
  // (bukan seukuran area lightbox) supaya garis dan label tidak jatuh di bidang kosong.
  const [ratio, setRatio] = useState(3 / 4);

  return (
    // container-type: size membuat unit cqw/cqh mengacu ke ukuran area ini.
    <div className="flex h-full w-full items-center justify-center" style={{ containerType: "size" }}>
      <div
        className="relative select-none"
        style={{ aspectRatio: ratio, width: `min(100cqw, calc(100cqh * ${ratio}))` }}
      >
        <Image
          src={afterSrc}
          alt={`${alt} (sesudah)`}
          fill
          sizes={sizes}
          className="object-cover"
          onLoad={(e) => setRatio(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
        />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <Image src={beforeSrc} alt={`${alt} (sebelum)`} fill sizes={sizes} className="object-cover" />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow"
          style={{ left: `${position}%` }}
        >
          <span className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-md">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
            </svg>
          </span>
        </div>

        <span className="pointer-events-none absolute top-3 left-3 rounded-none bg-foreground/70 px-2.5 py-1 text-xs text-white">
          Sebelum
        </span>
        <span className="pointer-events-none absolute top-3 right-3 rounded-none bg-foreground/70 px-2.5 py-1 text-xs text-white">
          Sesudah
        </span>

        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          aria-label="Geser untuk membandingkan sebelum dan sesudah makeup"
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
    </div>
  );
}
