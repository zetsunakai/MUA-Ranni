"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import type { FormState } from "@/app/admin/actions";
import { saveFaqs } from "@/app/admin/faq/actions";

type Item = { key: string; q: string; a: string };
const initialState: FormState = { status: "idle", message: "" };
let seed = 0;
const newKey = () => `faq-${Date.now()}-${seed++}`;

export default function FaqEditor({ initial }: { initial: { q: string; a: string }[] }) {
  const [state, formAction, saving] = useActionState(saveFaqs, initialState);
  const [items, setItems] = useState<Item[]>(() => initial.map((f) => ({ key: newKey(), ...f })));
  const errors = state.fieldErrors ?? {};

  const update = (key: string, patch: Partial<Item>) => setItems((c) => c.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  const move = (index: number, dir: -1 | 1) =>
    setItems((c) => {
      const next = [...c];
      [next[index], next[index + dir]] = [next[index + dir], next[index]];
      return next;
    });

  const onSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const formData = new FormData();
    formData.set("faqs", JSON.stringify(items.map(({ q, a }) => ({ q, a }))));
    startTransition(() => formAction(formData));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 pb-28">
      <ol className="space-y-4">
        {items.map((item, index) => (
          <li key={item.key} className={`border bg-surface p-4 ${errors[String(index)] ? "border-red-600" : "border-line"}`}>
            <div className="flex items-start gap-3">
              <span className="pt-3 font-heading text-xl text-foreground/50 tabular-nums">{String(index + 1).padStart(2, "0")}</span>
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  value={item.q}
                  onChange={(ev) => update(item.key, { q: ev.target.value })}
                  placeholder="Pertanyaan"
                  aria-label={`Pertanyaan ${index + 1}`}
                  maxLength={150}
                  className="min-h-11 w-full border border-line bg-background px-3 font-heading text-xl outline-none focus:border-accent-strong"
                />
                <textarea
                  value={item.a}
                  onChange={(ev) => update(item.key, { a: ev.target.value })}
                  placeholder="Jawaban"
                  aria-label={`Jawaban ${index + 1}`}
                  rows={3}
                  maxLength={1500}
                  className="w-full border border-line bg-background px-3 py-2 text-base leading-relaxed outline-none focus:border-accent-strong"
                />
                {errors[String(index)] && <p className="text-xs text-red-700">{errors[String(index)]}</p>}
              </div>
            </div>
            <div className="mt-2 flex justify-end gap-1">
              <button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Naikkan pertanyaan ${index + 1}`} className="h-10 w-10 border border-line text-sm disabled:opacity-25">▲</button>
              <button type="button" disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label={`Turunkan pertanyaan ${index + 1}`} className="h-10 w-10 border border-line text-sm disabled:opacity-25">▼</button>
              <button
                type="button"
                onClick={() => {
                  if (!item.q.trim() && !item.a.trim()) return setItems((c) => c.filter((i) => i.key !== item.key));
                  if (window.confirm(`Hapus pertanyaan "${item.q || "tanpa judul"}"?`)) setItems((c) => c.filter((i) => i.key !== item.key));
                }}
                className="h-10 px-3 text-sm text-red-700"
              >
                Hapus
              </button>
            </div>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={() => setItems((c) => [...c, { key: newKey(), q: "", a: "" }])}
        className="min-h-12 w-full border border-dashed border-line text-sm font-medium text-accent-strong hover:bg-accent-soft"
      >
        + Tambah pertanyaan
      </button>

      <div className="admin-savebar fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <p aria-live="polite" className={`flex-1 text-sm ${state.status === "error" ? "text-red-700" : "text-foreground/80"}`}>
            {saving ? "Menyimpan…" : state.message}
          </p>
          <button type="submit" disabled={saving} className="h-11 rounded-none bg-foreground px-6 font-medium text-white disabled:opacity-60">Simpan</button>
        </div>
      </div>
    </form>
  );
}
