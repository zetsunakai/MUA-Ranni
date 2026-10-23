"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { reorderPortfolio } from "@/app/admin/portofolio/actions";
import type { PortfolioItem } from "@/types";

type Item = Pick<PortfolioItem, "id" | "title" | "categoryLabel" | "imageUrl" | "featured">;

// Urutan diubah di layar dulu (langsung terlihat, tanpa menunggu server),
// lalu disimpan sekaligus dengan tombol Simpan.
export default function PortfolioOrderEditor({ items: initial }: { items: Item[] }) {
  const [items, setItems] = useState(initial);
  const [saved, setSaved] = useState(initial.map((i) => i.id).join());
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [saving, startSaving] = useTransition();
  const dirty = items.map((i) => i.id).join() !== saved;

  // Ingatkan kalau halaman ditutup sebelum urutan disimpan.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const move = (from: number, to: number) => {
    setResult(null);
    setItems((list) => {
      const next = [...list];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const save = () =>
    startSaving(async () => {
      const ids = items.map((i) => i.id);
      const res = await reorderPortfolio(ids);
      setResult(res);
      if (res.ok) setSaved(ids.join());
    });

  const status = saving
    ? { text: "Menyimpan…", error: false }
    : result
      ? { text: result.message, error: !result.ok }
      : dirty
        ? { text: "Urutan berubah, belum disimpan.", error: false }
        : { text: "", error: false };

  const buttonClass =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-base disabled:opacity-25";

  return (
    <div className="pb-28">
      <ol className="divide-y divide-line rounded-none border border-line bg-surface">
        {items.map((item, i) => (
          <li key={item.id} className="flex gap-3 px-3 py-3">
            <div className="relative h-20 w-15 shrink-0 overflow-hidden rounded-none bg-accent-soft">
              <Image src={item.imageUrl} alt="" fill sizes="60px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                <span className="text-foreground/60 tabular-nums">{i + 1}.</span> {item.title}
              </p>
              <p className="truncate text-xs text-foreground/70">
                {item.categoryLabel}
                {item.featured && " · Tampil di Home"}
              </p>
              {/* Tombol 44x44 px: cukup besar untuk jempol di HP. */}
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  aria-label={`Naikkan ${item.title}`}
                  className={buttonClass}
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === items.length - 1}
                  aria-label={`Turunkan ${item.title}`}
                  className={buttonClass}
                >
                  ▼
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 0)}
                  disabled={i === 0}
                  className="h-11 rounded-none border border-line px-4 text-sm disabled:opacity-25"
                >
                  Paling depan
                </button>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="admin-savebar fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <p aria-live="polite" className={`flex-1 text-sm ${status.error ? "text-red-700" : "text-foreground/80"}`}>
            {status.text}
          </p>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving}
            className="h-11 rounded-none bg-foreground px-6 font-medium text-white transition-colors hover:bg-foreground disabled:opacity-60"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
