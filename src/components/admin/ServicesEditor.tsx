"use client";

import { startTransition, useActionState, useState, useTransition, type FormEvent, type ReactNode } from "react";
import type { FormState } from "@/app/admin/actions";
import {
  addExtra,
  addGroup,
  addItem,
  deleteExtra,
  deleteGroup,
  deleteItem,
  move,
  saveServices,
  type ActionResult,
} from "@/app/admin/layanan/actions";
import type { AddOn, ServiceGroup } from "@/types";

const initialState: FormState = { status: "idle", message: "" };

// 150000 -> "150.000". Server membuang titik lagi saat menyimpan.
const display = (n: number | undefined) => (n === undefined ? "" : n.toLocaleString("id-ID"));

type Props = { groups: ServiceGroup[]; addOns: AddOn[] };

export default function ServicesEditor({ groups, addOns }: Props) {
  const [state, formAction, saving] = useActionState(saveServices, initialState);
  const [busy, startAction] = useTransition();
  const [notice, setNotice] = useState<ActionResult | null>(null);
  const errors = state.fieldErrors ?? {};

  // Tombol tambah/hapus/urutkan memanggil Server Action langsung (bukan lewat form),
  // lalu halaman dimuat ulang otomatis oleh revalidatePath. Isian yang sedang diketik
  // tetap ada karena setiap baris punya key tetap.
  const run = (action: () => Promise<ActionResult>, confirmMessage?: string) => {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    startAction(async () => {
      const result = await action();
      if (result.message) setNotice(result);
    });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setNotice(null);
    startTransition(() => formAction(formData));
  };

  const status = saving
    ? { text: "Menyimpan…", error: false }
    : busy
      ? { text: "Memproses…", error: false }
      : notice
        ? { text: notice.message, error: !notice.ok }
        : { text: state.message, error: state.status === "error" };

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-28">
      {groups.map((group, gi) => (
        <section key={group.id} className="rounded-xl border border-line bg-surface p-3 sm:p-5">
          <div className="flex items-start gap-2">
            <MoveButtons
              label={group.name}
              first={gi === 0}
              last={gi === groups.length - 1}
              onMove={(dir) => run(() => move("group", group.id, dir))}
            />
            <div className="min-w-0 flex-1 space-y-2">
              <Field error={errors[`group:${group.id}:name`]}>
                <input
                  name={`group:${group.id}:name`}
                  defaultValue={group.name}
                  aria-label="Nama grup"
                  className={`${inputClass(errors[`group:${group.id}:name`])} font-heading text-xl`}
                />
              </Field>
              <select
                name={`group:${group.id}:tier`}
                defaultValue={group.tier}
                aria-label={`Tipe grup ${group.name}`}
                className={inputClass()}
              >
                <option value="reguler">Reguler</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>

          <Field error={errors[`group:${group.id}:includes`]} className="mt-3">
            <label className="text-xs text-foreground/70">
              <span>Bonus/termasuk (satu per baris)</span>
              <textarea
                name={`group:${group.id}:includes`}
                defaultValue={group.includes.join("\n")}
                rows={Math.max(2, group.includes.length)}
                className={`${inputClass(errors[`group:${group.id}:includes`])} mt-1 text-sm`}
              />
            </label>
          </Field>

          <ul className="mt-3 divide-y divide-line border-t border-line">
            {group.items.map((item, ii) => (
              <li key={item.id} className="flex items-start gap-2 py-3">
                <MoveButtons
                  label={item.name}
                  first={ii === 0}
                  last={ii === group.items.length - 1}
                  onMove={(dir) => run(() => move("item", item.id, dir))}
                />
                <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[1fr_9rem]">
                  <Field error={errors[`item:${item.id}:name`]}>
                    <input
                      name={`item:${item.id}:name`}
                      defaultValue={item.name}
                      aria-label="Nama layanan"
                      className={inputClass(errors[`item:${item.id}:name`])}
                    />
                  </Field>
                  <Field error={errors[`item:${item.id}:price`]}>
                    <PriceInput name={`item:${item.id}:price`} defaultValue={display(item.price)} error={errors[`item:${item.id}:price`]} label={`Harga ${item.name}`} />
                  </Field>
                </div>
                <DeleteButton
                  label={`Hapus ${item.name}`}
                  onClick={() => run(() => deleteItem(item.id), `Hapus layanan "${item.name}"? Langsung hilang dari website.`)}
                />
              </li>
            ))}
          </ul>

          <AddRow
            placeholder="Nama layanan baru"
            withPrice
            buttonLabel="Tambah layanan"
            disabled={busy}
            onAdd={(name, price) => run(() => addItem(group.id, name, price))}
          />

          <div className="mt-3 border-t border-line pt-3 text-right">
            <button
              type="button"
              onClick={() =>
                run(
                  () => deleteGroup(group.id),
                  `Hapus grup "${group.name}" beserta ${group.items.length} layanan di dalamnya? Tidak bisa dikembalikan.`,
                )
              }
              className="h-11 rounded-full px-4 text-sm text-red-700"
            >
              Hapus grup ini
            </button>
          </div>
        </section>
      ))}

      <section className="rounded-xl border border-dashed border-line bg-surface p-3 sm:p-5">
        <h2 className="font-heading text-xl">Tambah grup</h2>
        <AddRow
          placeholder="contoh: Paket Keluarga"
          withTier
          buttonLabel="Tambah grup"
          disabled={busy}
          onAdd={(name, _price, groupTier) => run(() => addGroup(name, groupTier ?? "reguler"))}
        />
      </section>

      <section className="rounded-xl border border-line bg-surface p-3 sm:p-5">
        <h2 className="font-heading text-2xl">Layanan tambahan</h2>
        <ul className="mt-2 divide-y divide-line">
          {addOns.map((addOn, ai) => (
            <li key={addOn.id} className="flex items-start gap-2 py-3">
              <MoveButtons
                label={addOn.name}
                first={ai === 0}
                last={ai === addOns.length - 1}
                onMove={(dir) => run(() => move("addon", addOn.id, dir))}
              />
              <div className="grid min-w-0 flex-1 gap-2">
                <Field error={errors[`addon:${addOn.id}:name`]}>
                  <input name={`addon:${addOn.id}:name`} defaultValue={addOn.name} aria-label="Nama layanan tambahan" className={inputClass(errors[`addon:${addOn.id}:name`])} />
                </Field>
                <Field error={errors[`addon:${addOn.id}:note`]}>
                  <input
                    name={`addon:${addOn.id}:note`}
                    defaultValue={addOn.note}
                    placeholder="Catatan (opsional), mis. Sesuai request"
                    aria-label="Catatan"
                    className={`${inputClass(errors[`addon:${addOn.id}:note`])} text-sm`}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field error={errors[`addon:${addOn.id}:from`]}>
                    <PriceInput name={`addon:${addOn.id}:from`} defaultValue={display(addOn.priceFrom)} error={errors[`addon:${addOn.id}:from`]} label="Harga mulai" />
                  </Field>
                  <Field error={errors[`addon:${addOn.id}:to`]}>
                    <PriceInput name={`addon:${addOn.id}:to`} defaultValue={display(addOn.priceTo)} error={errors[`addon:${addOn.id}:to`]} label="Sampai (opsional)" placeholder="sampai…" />
                  </Field>
                </div>
              </div>
              <DeleteButton
                label={`Hapus ${addOn.name}`}
                onClick={() => run(() => deleteExtra(addOn.id), `Hapus "${addOn.name}"?`)}
              />
            </li>
          ))}
        </ul>
        <AddRow placeholder="Nama layanan tambahan" withPrice buttonLabel="Tambah" disabled={busy} onAdd={(name, price) => run(() => addExtra(name, price))} />
      </section>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <p aria-live="polite" className={`flex-1 text-sm ${status.error ? "text-red-700" : "text-foreground/80"}`}>
            {status.text}
          </p>
          <button
            type="submit"
            disabled={saving || busy}
            className="h-11 rounded-full bg-accent-strong px-6 font-medium text-white transition-colors hover:bg-foreground disabled:opacity-60"
          >
            Simpan
          </button>
        </div>
      </div>
    </form>
  );
}

function inputClass(error?: string) {
  return `h-11 w-full rounded-lg border bg-background px-3 text-base outline-none focus:border-accent-strong ${
    error ? "border-red-600" : "border-line"
  }`;
}

function Field({ error, className = "", children }: { error?: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      {children}
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}

function PriceInput({ name, defaultValue, error, label, placeholder }: { name: string; defaultValue: string; error?: string; label: string; placeholder?: string }) {
  return (
    <div className={`flex h-11 items-center rounded-lg border bg-background px-3 focus-within:border-accent-strong ${error ? "border-red-600" : "border-line"}`}>
      <span className="text-sm text-foreground/70">Rp</span>
      <input
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={label}
        aria-invalid={Boolean(error)}
        className="w-full bg-transparent pl-1.5 text-right text-base tabular-nums outline-none"
      />
    </div>
  );
}

function MoveButtons({ label, first, last, onMove }: { label: string; first: boolean; last: boolean; onMove: (dir: "up" | "down") => void }) {
  const cls = "flex h-11 w-11 items-center justify-center rounded-full border border-line text-sm disabled:opacity-25";
  return (
    <div className="flex shrink-0 flex-col gap-1">
      <button type="button" disabled={first} onClick={() => onMove("up")} aria-label={`Naikkan ${label}`} className={cls}>
        ▲
      </button>
      <button type="button" disabled={last} onClick={() => onMove("down")} aria-label={`Turunkan ${label}`} className={cls}>
        ▼
      </button>
    </div>
  );
}

function DeleteButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-red-700">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  );
}

// Baris "tambah" memakai state sendiri (input tanpa atribut name), jadi tidak ikut
// terkirim saat tombol Simpan utama ditekan.
function AddRow({
  placeholder,
  buttonLabel,
  withPrice,
  withTier,
  disabled,
  onAdd,
}: {
  placeholder: string;
  buttonLabel: string;
  withPrice?: boolean;
  withTier?: boolean;
  disabled: boolean;
  onAdd: (name: string, price: string, tier?: string) => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [tierValue, setTierValue] = useState("reguler");

  const submit = () => {
    if (!name.trim()) return;
    onAdd(name, price, tierValue);
    setName("");
    setPrice("");
  };

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submit())}
        placeholder={placeholder}
        aria-label={placeholder}
        className={inputClass()}
      />
      {withPrice && (
        <div className="flex h-11 items-center rounded-lg border border-line bg-background px-3 focus-within:border-accent-strong sm:w-36">
          <span className="text-sm text-foreground/70">Rp</span>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submit())}
            inputMode="numeric"
            placeholder="harga"
            aria-label="Harga"
            className="w-full bg-transparent pl-1.5 text-right text-base tabular-nums outline-none"
          />
        </div>
      )}
      {withTier && (
        <select value={tierValue} onChange={(e) => setTierValue(e.target.value)} aria-label="Tipe grup" className={`${inputClass()} sm:w-36`}>
          <option value="reguler">Reguler</option>
          <option value="premium">Premium</option>
        </select>
      )}
      <button
        type="button"
        onClick={submit}
        disabled={disabled || !name.trim()}
        className="h-11 rounded-full border border-accent-strong px-4 text-sm font-medium text-accent-strong disabled:opacity-40"
      >
        + {buttonLabel}
      </button>
    </div>
  );
}
