"use client";

import { startTransition, useActionState, useState, type FormEvent, type ReactNode } from "react";
import type { FormState } from "@/app/admin/actions";
import { saveExpense } from "@/app/admin/belanja/actions";
import { EXPENSE_CATEGORY_LABELS, type ExpenseCategory } from "@/lib/expense-labels";

const initialState: FormState = { status: "idle", message: "" };

export type ExpenseDraft = {
  id?: string;
  spentOn: string;
  category: ExpenseCategory;
  item: string;
  store: string;
  amount: number;
  note: string;
};

export default function ExpenseForm({ draft }: { draft: ExpenseDraft }) {
  const [state, formAction, saving] = useActionState(saveExpense, initialState);
  const [amount, setAmount] = useState(draft.amount);
  const e = state.fieldErrors ?? {};

  // Kirim manual supaya isian tidak di-reset kalau ada error.
  const onSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const formData = new FormData(ev.currentTarget);
    startTransition(() => formAction(formData));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-28">
      {draft.id && <input type="hidden" name="id" value={draft.id} />}

      <section className="space-y-4 border border-line bg-surface p-4 sm:p-5">
        <fieldset>
          <legend className="text-sm font-medium">Kategori</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map((c) => (
              <label key={c} className="cursor-pointer">
                <input type="radio" name="category" value={c} defaultChecked={draft.category === c} className="peer sr-only" />
                <span className="inline-flex min-h-11 items-center border border-line px-4 text-sm peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:outline-2 peer-focus-visible:outline-accent-strong">
                  {EXPENSE_CATEGORY_LABELS[c]}
                </span>
              </label>
            ))}
          </div>
          {e.category && <p className="mt-1 text-xs text-red-700">{e.category}</p>}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="item" label="Nama barang" error={e.item}>
            <input id="item" name="item" required maxLength={120} defaultValue={draft.item} placeholder="mis. Foundation Make Over, kuas blending" className={inputClass(e.item)} />
          </Field>
          <Field id="amount" label="Harga" error={e.amount}>
            <div className={`mt-1 flex min-h-11 items-center border bg-background focus-within:border-accent-strong ${e.amount ? "border-red-600" : "border-line"}`}>
              <span className="pl-3 text-foreground/50">Rp</span>
              <input
                id="amount"
                type="text"
                inputMode="numeric"
                required
                value={amount ? amount.toLocaleString("id-ID") : ""}
                placeholder="0"
                onChange={(ev) => setAmount(Math.min(1_000_000_000, Number(ev.target.value.replace(/\D/g, "")) || 0))}
                className="h-11 min-w-0 flex-1 bg-transparent px-2 text-base text-foreground tabular-nums outline-none"
              />
              <input type="hidden" name="amount" value={amount} />
            </div>
          </Field>
          <Field id="store" label="Toko" hint="Opsional" error={e.store}>
            <input id="store" name="store" maxLength={80} defaultValue={draft.store} placeholder="mis. Shopee, Sociolla, toko kosmetik" className={inputClass(e.store)} />
          </Field>
          <Field id="spentOn" label="Tanggal beli" error={e.spentOn}>
            <input id="spentOn" name="spentOn" type="date" required defaultValue={draft.spentOn} className={inputClass(e.spentOn)} />
          </Field>
        </div>

        <Field id="note" label="Catatan" hint="Opsional" error={e.note}>
          <textarea id="note" name="note" rows={2} maxLength={300} defaultValue={draft.note} className={`${inputClass(e.note)} py-2`} />
        </Field>
      </section>

      <div className="admin-savebar fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <p aria-live="polite" className={`flex-1 text-sm ${state.status === "error" ? "text-red-700" : "text-foreground/80"}`}>{saving ? "Menyimpan…" : state.message}</p>
          <button type="submit" disabled={saving} className="h-11 rounded-none bg-foreground px-6 font-medium text-white disabled:opacity-60">
            Simpan
          </button>
        </div>
      </div>
    </form>
  );
}

function inputClass(error?: string) {
  return `mt-1 min-h-11 w-full rounded-none border bg-background px-3 text-base text-foreground outline-none focus:border-accent-strong ${error ? "border-red-600" : "border-line"}`;
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label} {hint && <span className="font-normal text-foreground/60">({hint})</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
