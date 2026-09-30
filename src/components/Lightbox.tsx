"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { bookingFormUrl } from "@/lib/whatsapp";
import type { PortfolioItem } from "@/types";

type Props = {
  items: PortfolioItem[];
  index: number | null; // null = tertutup
  onClose: () => void;
  onNavigate: (index: number) => void;
};

const IMAGE_SIZES = "(min-width: 768px) 60vw, 100vw";

// Memakai elemen <dialog> bawaan browser: showModal() sudah mengurus
// fokus keyboard, tombol Esc, dan menonaktifkan konten di belakangnya.
export default function Lightbox({ items, index, onClose, onNavigate }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const item = index === null ? null : items[index];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (item && !dialog.open) dialog.showModal();
    if (!item && dialog.open) dialog.close();
  }, [item]);

  const go = (step: number) => {
    if (index === null) return;
    onNavigate((index + step + items.length) % items.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    // Biarkan panah menggeser slider before-after kalau slider sedang fokus.
    if (e.target instanceof HTMLInputElement) return;
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  };

  const label = item ? `${item.title}, riasan ${item.categoryLabel}` : "";

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onKeyDown={handleKeyDown}
      aria-label={item?.title}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-foreground/90"
    >
      {item && (
        // Klik area gelap di luar panel = tutup.
        <div
          className="flex h-full items-center justify-center p-0 md:p-8"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <div className="flex h-full w-full max-w-6xl flex-col overflow-hidden bg-surface md:h-auto md:max-h-full md:flex-row md:rounded-xl">
            <div className="relative h-[62dvh] shrink-0 bg-foreground md:h-[85dvh] md:flex-1">
              {item.beforeImageUrl ? (
                <BeforeAfterSlider
                  key={item.id}
                  beforeSrc={item.beforeImageUrl}
                  afterSrc={item.imageUrl}
                  alt={label}
                  sizes={IMAGE_SIZES}
                />
              ) : (
                <Image key={item.id} src={item.imageUrl} alt={label} fill sizes={IMAGE_SIZES} className="object-contain" />
              )}

              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Foto sebelumnya"
                className="absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full bg-surface/90 p-2 shadow"
              >
                <Chevron direction="left" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Foto berikutnya"
                className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full bg-surface/90 p-2 shadow"
              >
                <Chevron direction="right" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5 md:w-80 md:flex-none md:p-6">
              <div className="flex items-start justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
                  {item.categoryLabel}
                </p>
                <button type="button" onClick={onClose} aria-label="Tutup" className="-mt-1 -mr-1 rounded-full p-1">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <h2 className="font-heading text-3xl leading-tight">{item.title}</h2>
              {item.description && <p className="text-sm text-foreground/75">{item.description}</p>}
              {item.beforeImageUrl && (
                <p className="text-xs text-foreground/70">Geser garis di foto untuk melihat sebelum dan sesudah.</p>
              )}
              <a
                href={bookingFormUrl("lightbox", {
                  eventType: item.categoryLabel,
                  note: `Saya tertarik dengan look "${item.title}".`,
                })}
                className="mt-auto rounded-full bg-accent-strong py-3 text-center font-medium text-white transition-colors hover:bg-foreground"
              >
                Tanya look ini via WhatsApp
              </a>
              <p className="text-center text-xs text-foreground/70">
                {index! + 1} / {items.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}
