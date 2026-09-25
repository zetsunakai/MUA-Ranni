"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { updatePrices, type FormState } from "@/app/admin/actions";
import type { AddOn, ServiceGroup } from "@/types";

const initialState: FormState = { status: "idle", message: "" };

// 150000 -> "150.000" supaya mudah dibaca di HP. Server membuang titik lagi saat menyimpan.
const display = (n: number | undefined) => (n === undefined ? "" : n.toLocaleString("id-ID"));

type Props = { groups: ServiceGroup[]; addOns: AddOn[] };

export default function PriceEditor({ groups, addOns }: Props) {
  const [state, formAction, pending] = useActionState(updatePrices, initialState);
  const errors = state.fieldErrors ?? {};

  // Form dikirim manual (bukan <form action>) supaya isian tidak di-reset React
  // kalau ada error; admin tidak perlu mengetik ulang.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => formAction(formData));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-28">
      {groups.map((group) => (
        <section key={group.id} className="rounded-xl border border-line bg-surface p-4 sm:p-5">
          <h2 className="font-heading text-xl font-semibold">{group.name}</h2>
          <p className="mt-0.5 text-xs text-foreground/70">Termasuk: {group.includes.join(", ")}</p>
          <ul className="mt-3 divide-y divide-line">
            {group.items.map((item) => (
              <li key={item.id}>
                <PriceField
                  name={`item:${item.id}`}
                  label={item.name}
                  defaultValue={display(item.price)}
                  error={errors[`item:${item.id}`]}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="rounded-xl border border-line bg-surface p-4 sm:p-5">
        <h2 className="font-heading text-xl font-semibold">Tambahan</h2>
        <ul className="mt-3 divide-y divide-line">
          {addOns.map((addOn) => (
            <li key={addOn.id} className="py-3">
              <p className="text-sm font-medium">{addOn.name}</p>
              {addOn.note && <p className="text-xs text-foreground/70">{addOn.note}</p>}
              <div className="mt-2 grid grid-cols-2 gap-3">
                <PriceField
                  name={`addon:${addOn.id}:from`}
                  label="Mulai dari"
                  defaultValue={display(addOn.priceFrom)}
                  error={errors[`addon:${addOn.id}:from`]}
                  compact
                />
                <PriceField
                  name={`addon:${addOn.id}:to`}
                  label="Sampai (opsional)"
                  defaultValue={display(addOn.priceTo)}
                  error={errors[`addon:${addOn.id}:to`]}
                  compact
                  optional
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Tombol simpan menempel di bawah layar, mudah dijangkau jempol di HP. */}
      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <p
            aria-live="polite"
            className={`flex-1 text-sm ${state.status === "error" ? "text-red-700" : "text-foreground/80"}`}
          >
            {pending ? "Menyimpan…" : state.message}
          </p>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-accent-strong px-6 py-3 font-medium text-white transition-colors hover:bg-foreground disabled:opacity-60"
          >
            Simpan
          </button>
        </div>
      </div>
    </form>
  );
}

type FieldProps = {
  name: string;
  label: string;
  defaultValue: string;
  error?: string;
  compact?: boolean;
  optional?: boolean;
};

function PriceField({ name, label, defaultValue, error, compact, optional }: FieldProps) {
  const id = name.replaceAll(":", "-");
  return (
    <div className={compact ? "" : "flex items-center gap-3 py-3"}>
      <label htmlFor={id} className={compact ? "text-xs text-foreground/70" : "flex-1 text-sm"}>
        {label}
      </label>
      <div className={compact ? "mt-1" : "w-36 shrink-0"}>
        <div
          className={`flex items-center rounded-lg border bg-background px-3 focus-within:border-accent-strong ${
            error ? "border-red-600" : "border-line"
          }`}
        >
          <span className="text-sm text-foreground/70">Rp</span>
          <input
            id={id}
            name={name}
            // "text" + inputMode numeric: keyboard angka di HP, tapi titik ribuan tetap boleh.
            type="text"
            inputMode="numeric"
            autoComplete="off"
            defaultValue={defaultValue}
            required={!optional}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className="w-full bg-transparent py-2.5 pl-1.5 text-right text-base tabular-nums outline-none"
          />
        </div>
        {error && (
          <p id={`${id}-error`} className="mt-1 text-xs text-red-700">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
