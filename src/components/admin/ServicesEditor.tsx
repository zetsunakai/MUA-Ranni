"use client";

import { ServiceComparison } from "@/components/editorial/ServiceSuite";
import { formatRupiah } from "@/lib/format";
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
import type { AddOn, CategoryOption, ServiceGroup } from "@/types";

const initialState: FormState = { status: "idle", message: "" };

// 150000 -> "150.000". Server membuang titik lagi saat menyimpan.
const display = (n: number | undefined) => (n === undefined ? "" : n.toLocaleString("id-ID"));

type Props = { groups: ServiceGroup[]; addOns: AddOn[]; categories: CategoryOption[] };

export default function ServicesEditor({ groups, addOns, categories }: Props) {
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
    <form onSubmit={onSubmit} className="services-configurator space-y-10 pb-28">
      <div className="suite-config-grid">
      {groups.map((group, gi) => (
        <section key={group.id} className="suite-config-card">
          <h2 className="mb-4 font-heading text-3xl">{group.name}</h2>
          {group.items.length > 0 && <div className="suite-price"><p className="editorial-label">Harga mulai dari, per orang.</p><p className="font-heading">{formatRupiah(Math.min(...group.items.map(item => item.price)))}</p></div>}
          <details className="suite-config-details" open={Object.keys(errors).some(key => key.includes(group.id) || group.items.some(item => key.startsWith(`item:${item.id}:`)))}><summary>Ubah harga <span>({group.items.length} layanan) +</span></summary>
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
                <div className="suite-item-inputs grid min-w-0 flex-1 gap-2 sm:grid-cols-[1fr_9rem]">
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
                  {/* Ringkas: tampilkan jenis acara terpilih, chip lengkap dibuka saat perlu.
                      Checkbox di dalam <details> yang tertutup tetap ikut terkirim saat Simpan. */}
                  <details className="group text-xs">
                    <summary className="flex min-h-9 cursor-pointer list-none items-center gap-1 text-foreground/70 [&::-webkit-details-marker]:hidden">
                      <span className="min-w-0 truncate">
                        {item.categories?.length
                          ? categories.filter((c) => item.categories?.includes(c.id)).map((c) => c.label).join(", ")
                          : "Belum ada jenis acara"}
                      </span>
                      <span className="shrink-0 text-accent-strong underline underline-offset-2 group-open:hidden">ubah</span>
                      <span className="hidden shrink-0 text-accent-strong underline underline-offset-2 group-open:inline">tutup</span>
                    </summary>
                    <fieldset className="mt-1 flex flex-wrap gap-1">
                      <legend className="sr-only">Jenis acara untuk {item.name}</legend>
                      {categories.map((category) => (
                        <label key={category.id} className="cursor-pointer">
                          <input type="checkbox" name={`item:${item.id}:cat`} value={category.id} defaultChecked={item.categories?.includes(category.id)} className="peer sr-only" />
                          <span className="inline-flex min-h-8 items-center border border-line px-2 text-xs text-foreground/70 peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:outline-2 peer-focus-visible:outline-accent-strong">
                            {category.label}
                          </span>
                        </label>
                      ))}
                    </fieldset>
                  </details>
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
          </details>
        </section>
      ))}
      </div>

      <section className="rounded-none border border-dashed border-line bg-surface p-3 sm:p-5">
        <h2 className="font-heading text-xl">Tambah grup</h2>
        <AddRow
          placeholder="contoh: Paket Keluarga"
          withTier
          buttonLabel="Tambah grup"
          disabled={busy}
          onAdd={(name, _price, groupTier) => run(() => addGroup(name, groupTier ?? "reguler"))}
        />
      </section>

      <section className="addons-editor rounded-none border border-line bg-surface p-5 sm:p-8">
        <h2 className="font-heading text-2xl">Layanan tambahan</h2>
        {/* Satu baris per layanan tambahan, seperti tabel: nama · catatan · harga · aksi. */}
        <div className="mt-4 hidden grid-cols-[5rem_minmax(0,1.2fr)_minmax(0,1fr)_17rem_2.5rem] gap-2 px-1 pb-2 text-[10px] tracking-[0.14em] text-foreground/60 uppercase sm:grid">
          <span className="sr-only">Urutan</span>
          <span>Layanan</span>
          <span>Catatan (opsional)</span>
          <span>Harga mulai – sampai</span>
          <span className="sr-only">Aksi</span>
        </div>
        <ul className="divide-y divide-line border-y border-line">
          {addOns.map((addOn, ai) => {
            const err = (field: string) => errors[`addon:${addOn.id}:${field}`];
            const rowError = err("name") ?? err("note") ?? err("from") ?? err("to");
            return (
              <li key={addOn.id} className="py-3">
                <div className="grid grid-cols-[5rem_minmax(0,1fr)_2.5rem] items-center gap-2 sm:grid-cols-[5rem_minmax(0,1.2fr)_minmax(0,1fr)_17rem_2.5rem]">
                  <div className="flex items-center gap-0">
                    <IconButton label={`Naikkan ${addOn.name}`} disabled={ai === 0} onClick={() => run(() => move("addon", addOn.id, "up"))}>▲</IconButton>
                    <IconButton label={`Turunkan ${addOn.name}`} disabled={ai === addOns.length - 1} onClick={() => run(() => move("addon", addOn.id, "down"))}>▼</IconButton>
                  </div>
                  <input name={`addon:${addOn.id}:name`} defaultValue={addOn.name} aria-label="Nama layanan tambahan" className={inputClass(err("name"))} />
                  <input
                    name={`addon:${addOn.id}:note`}
                    defaultValue={addOn.note}
                    placeholder="mis. Sesuai request"
                    aria-label={`Catatan ${addOn.name}`}
                    className={`${inputClass(err("note"))} col-span-2 col-start-2 row-start-2 text-sm sm:col-span-1 sm:col-start-auto sm:row-start-auto`}
                  />
                  <div className="col-span-2 col-start-2 row-start-3 flex items-center gap-1.5 sm:col-span-1 sm:col-start-auto sm:row-start-auto">
                    <div className="min-w-0 flex-1"><PriceInput name={`addon:${addOn.id}:from`} defaultValue={display(addOn.priceFrom)} error={err("from")} label={`Harga mulai ${addOn.name}`} /></div>
                    <span aria-hidden="true" className="text-foreground/50">–</span>
                    <div className="min-w-0 flex-1"><PriceInput name={`addon:${addOn.id}:to`} defaultValue={display(addOn.priceTo)} error={err("to")} label={`Harga sampai ${addOn.name} (opsional)`} placeholder="opsional" /></div>
                  </div>
                  <div className="col-start-3 row-start-1 flex justify-end sm:col-start-auto sm:row-start-auto">
                    <IconButton label={`Hapus ${addOn.name}`} danger onClick={() => run(() => deleteExtra(addOn.id), `Hapus "${addOn.name}"?`)}>✕</IconButton>
                  </div>
                </div>
                {rowError && <p className="mt-1 text-xs text-red-700">{rowError}</p>}
              </li>
            );
          })}
        </ul>
        <AddRow placeholder="Nama layanan tambahan" withPrice buttonLabel="Tambah" disabled={busy} onAdd={(name, price) => run(() => addExtra(name, price))} />
      </section>

      <section><h2 className="mb-5 font-heading text-3xl">Termasuk</h2><ServiceComparison groups={groups} /></section>

      <div className="admin-savebar fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <p aria-live="polite" className={`flex-1 text-sm ${status.error ? "text-red-700" : "text-foreground/80"}`}>
            {status.text}
          </p>
          <button
            type="submit"
            disabled={saving || busy}
            className="h-11 rounded-none bg-foreground px-6 font-medium text-white transition-colors hover:bg-foreground disabled:opacity-60"
          >
            Simpan
          </button>
        </div>
      </div>
    </form>
  );
}

function inputClass(error?: string) {
  return `h-11 w-full rounded-none border bg-background px-3 text-base outline-none focus:border-accent-strong ${
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
    <div className={`flex h-11 items-center rounded-none border bg-background px-3 focus-within:border-accent-strong ${error ? "border-red-600" : "border-line"}`}>
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

function IconButton({ label, disabled, danger, onClick, children }: { label: string; disabled?: boolean; danger?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-10 w-10 items-center justify-center text-sm hover:bg-accent-soft disabled:opacity-25 ${danger ? "text-red-700" : "text-foreground/70"}`}
    >
      {children}
    </button>
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
    <div className="add-row mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submit())}
        placeholder={placeholder}
        aria-label={placeholder}
        className={inputClass()}
      />
      {withPrice && (
        <div className="flex h-11 items-center rounded-none border border-line bg-background px-3 focus-within:border-accent-strong sm:w-36">
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
        className="h-11 rounded-none border border-accent-strong px-4 text-sm font-medium text-accent-strong disabled:opacity-40"
      >
        + {buttonLabel}
      </button>
    </div>
  );
}
