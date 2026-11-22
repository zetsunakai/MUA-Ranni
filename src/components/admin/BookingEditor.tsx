"use client";

import { startTransition, useActionState, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { FormState } from "@/app/admin/actions";
import { saveBooking } from "@/app/admin/booking/actions";
import { bookingTotals } from "@/lib/booking-math";
import { formatRupiah } from "@/lib/format";

export type EditorLine = { key: string; serviceItemId: string | null; description: string; qty: number; unitPrice: number };

export type BookingDraft = {
  id?: string;
  clientName: string;
  clientPhone: string;
  eventType: string;
  eventDate: string;
  makeupTime: string;
  location: string;
  mapsUrl: string;
  people: string;
  hairdo: string;
  note: string;
  transportFee: number;
  discount: number;
  lines: EditorLine[];
};

type Catalog = {
  groups: { name: string; items: { id: string; name: string; price: number; categories?: string[] }[] }[];
  addOns: { id: string; name: string; priceFrom: number }[];
};

type EventType = { id: string; label: string };
type Props = { draft: BookingDraft; catalog: Catalog; eventTypes: EventType[] };

const initialState: FormState = { status: "idle", message: "" };
let keySeed = 0;
const newKey = () => `line-${Date.now()}-${keySeed++}`;

export default function BookingEditor({ draft, catalog, eventTypes }: Props) {
  const [state, formAction, saving] = useActionState(saveBooking, initialState);
  const [lines, setLines] = useState<EditorLine[]>(draft.lines);
  const [people, setPeople] = useState(draft.people);
  const [transportFee, setTransportFee] = useState(draft.transportFee);
  const [discount, setDiscount] = useState(draft.discount);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [eventType, setEventType] = useState(draft.eventType);
  const eventCategory = eventTypes.find((t) => t.label === eventType);
  // Booking lama bisa berisi jenis acara yang kategorinya sudah dihapus/diganti; tetap tampilkan.
  const eventOptions = draft.eventType && !eventTypes.some((t) => t.label === draft.eventType) ? [...eventTypes, { id: "", label: draft.eventType }] : eventTypes;
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const e = state.fieldErrors ?? {};
  const totals = bookingTotals(lines, transportFee, discount);

  // Kirim manual supaya isian tidak di-reset kalau ada error.
  const onSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const formData = new FormData(ev.currentTarget);
    formData.set("lines", JSON.stringify(lines.map((l) => ({ serviceItemId: l.serviceItemId, description: l.description, qty: l.qty, unitPrice: l.unitPrice }))));
    startTransition(() => formAction(formData));
  };

  const updateLine = (key: string, patch: Partial<EditorLine>) =>
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)));

  // Pilih dari price list: harga disalin, qty awal = jumlah orang (kalau sudah diisi).
  const addFromCatalog = (value: string) => {
    if (!value) return;
    setPickerOpen(false);
    const defaultQty = Math.max(1, Number(people) || 1);
    const [kind, id] = value.split(":");
    if (kind === "item") {
      const item = catalog.groups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.name }))).find((i) => i.id === id);
      if (item) setLines((c) => [...c, { key: newKey(), serviceItemId: item.id, description: `${item.group} — ${item.name}`, qty: defaultQty, unitPrice: item.price }]);
    } else if (kind === "addon") {
      const addOn = catalog.addOns.find((a) => a.id === id);
      if (addOn) setLines((c) => [...c, { key: newKey(), serviceItemId: null, description: addOn.name, qty: 1, unitPrice: addOn.priceFrom }]);
    } else {
      const key = newKey();
      setFocusKey(key);
      setLines((c) => [...c, { key, serviceItemId: null, description: "", qty: 1, unitPrice: 0 }]);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-28">
      {draft.id && <input type="hidden" name="id" value={draft.id} />}

      <Section title="Klien & acara">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="clientName" label="Nama klien" error={e.clientName}>
            <input id="clientName" name="clientName" required defaultValue={draft.clientName} className={inputClass(e.clientName)} />
          </Field>
          <Field id="clientPhone" label="No. WhatsApp klien" error={e.clientPhone}>
            <input id="clientPhone" name="clientPhone" inputMode="tel" defaultValue={draft.clientPhone} className={inputClass(e.clientPhone)} />
          </Field>
          <Field id="eventType" label="Jenis acara" error={e.eventType}>
            <select id="eventType" name="eventType" value={eventType} onChange={(ev) => setEventType(ev.target.value)} className={inputClass(e.eventType)}>
              <option value="">Pilih jenis acara…</option>
              {eventOptions.map((t) => <option key={t.label} value={t.label}>{t.label}</option>)}
            </select>
          </Field>
          <Field id="eventDate" label="Tanggal acara" error={e.eventDate}>
            <input id="eventDate" name="eventDate" type="date" required defaultValue={draft.eventDate} className={inputClass(e.eventDate)} />
          </Field>
          <Field id="makeupTime" label="Jam makeup" error={e.makeupTime}>
            <input id="makeupTime" name="makeupTime" type="time" defaultValue={draft.makeupTime} className={inputClass(e.makeupTime)} />
          </Field>
          <Field id="people" label="Jumlah orang" error={e.people}>
            <input id="people" name="people" type="number" min={1} max={100} inputMode="numeric" value={people} onChange={(ev) => setPeople(ev.target.value)} className={inputClass(e.people)} />
          </Field>
          <Field id="hairdo" label="Hijab do / Hair do" error={e.hairdo}>
            <input id="hairdo" name="hairdo" defaultValue={draft.hairdo} className={inputClass(e.hairdo)} />
          </Field>
          <Field id="mapsUrl" label="Link Google Maps" error={e.mapsUrl}>
            <input id="mapsUrl" name="mapsUrl" type="url" defaultValue={draft.mapsUrl} className={inputClass(e.mapsUrl)} />
          </Field>
        </div>
        <Field id="location" label="Alamat lokasi makeup" error={e.location}>
          <textarea id="location" name="location" rows={2} defaultValue={draft.location} className={`${inputClass(e.location)} py-2`} />
        </Field>
        <Field id="note" label="Catatan" hint="Catatan pribadi, tidak dikirim ke klien." error={e.note}>
          <textarea id="note" name="note" rows={3} defaultValue={draft.note} className={`${inputClass(e.note)} py-2`} />
        </Field>
      </Section>

      <Section title="Layanan & harga">
        <ul className={`border bg-background ${e.lines ? "border-red-600" : "border-line"}`}>
          {lines.map((line) => (
            <LineItem
              key={line.key}
              line={line}
              autoFocus={line.key === focusKey}
              onChange={(patch) => updateLine(line.key, patch)}
              onRemove={() => setLines((c) => c.filter((l) => l.key !== line.key))}
            />
          ))}
          <li className={lines.length ? "border-t border-dashed border-line" : ""}>
            {pickerOpen ? (
              <ServicePicker catalog={catalog} category={eventCategory} onPick={addFromCatalog} onClose={() => setPickerOpen(false)} />
            ) : (
              <button type="button" onClick={() => setPickerOpen(true)} className="flex min-h-14 w-full items-center gap-2 px-4 text-left text-sm font-medium text-accent-strong hover:bg-accent-soft">
                <span aria-hidden="true" className="text-lg leading-none">+</span>
                {lines.length ? "Tambah layanan" : "Tambah layanan pertama"}
              </button>
            )}
          </li>
        </ul>
        {e.lines && <p className="text-xs text-red-700">{e.lines}</p>}

        <dl className="space-y-3 pt-2 text-sm">
          <div className="flex items-center justify-between gap-4 text-foreground/80">
            <dt>Subtotal layanan</dt>
            <dd>{formatRupiah(totals.subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 text-foreground/80">
            <dt><label htmlFor="transportFee">Transport</label></dt>
            <dd className="w-40"><MoneyInput id="transportFee" name="transportFee" value={transportFee} onChange={setTransportFee} invalid={Boolean(e.transportFee)} /></dd>
          </div>
          <div className="flex items-center justify-between gap-4 text-foreground/80">
            <dt><label htmlFor="discount">Diskon</label></dt>
            <dd className="w-40"><MoneyInput id="discount" name="discount" value={discount} onChange={setDiscount} invalid={Boolean(e.discount)} /></dd>
          </div>
          {(e.transportFee || e.discount) && <p className="text-right text-xs text-red-700">{e.transportFee ?? e.discount}</p>}
          <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3 font-heading text-2xl">
            <dt>Total</dt>
            <dd>{formatRupiah(totals.total)}</dd>
          </div>
        </dl>
      </Section>

      <div className="admin-savebar fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <p aria-live="polite" className={`flex-1 text-sm ${state.status === "error" ? "text-red-700" : "text-foreground/80"}`}>
            {saving ? "Menyimpan…" : state.message || `Total ${formatRupiah(totals.total)}`}
          </p>
          <button type="submit" disabled={saving} className="h-11 rounded-none bg-foreground px-6 font-medium text-white disabled:opacity-60">
            {draft.id ? "Simpan" : "Buat estimasi"}
          </button>
        </div>
      </div>
    </form>
  );
}

function inputClass(error?: string) {
  return `mt-1 min-h-11 w-full rounded-none border bg-background px-3 text-base text-foreground outline-none focus:border-accent-strong ${
    error ? "border-red-600" : "border-line"
  }`;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-none border border-line bg-surface p-4 sm:p-5">
      <h2 className="font-heading text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      {hint && <p className="text-xs text-foreground/70">{hint}</p>}
      {children}
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}

// Satu baris layanan: nama penuh + total di baris atas, qty dan harga satuan di bawahnya.
function LineItem({ line, autoFocus, onChange, onRemove }: { line: EditorLine; autoFocus: boolean; onChange: (patch: Partial<EditorLine>) => void; onRemove: () => void }) {
  return (
    <li className="border-b border-line px-4 py-3 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <input
          value={line.description}
          onChange={(ev) => onChange({ description: ev.target.value })}
          placeholder="Nama layanan"
          aria-label="Nama layanan"
          autoFocus={autoFocus}
          className="min-h-9 min-w-0 flex-1 border-b border-transparent bg-transparent text-base font-medium text-foreground outline-none placeholder:text-foreground/40 hover:border-line focus:border-accent-strong"
        />
        <p className="shrink-0 pt-1.5 font-medium tabular-nums">{formatRupiah(line.qty * line.unitPrice)}</p>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-foreground/75">
        <div className="flex items-center border border-line" role="group" aria-label="Jumlah">
          <button type="button" onClick={() => onChange({ qty: Math.max(1, line.qty - 1) })} disabled={line.qty <= 1} aria-label="Kurangi" className="h-9 w-9 text-lg disabled:opacity-30">−</button>
          <input
            type="text"
            inputMode="numeric"
            value={line.qty}
            onChange={(ev) => onChange({ qty: Math.min(50, Math.max(1, Number(ev.target.value.replace(/\D/g, "")) || 1)) })}
            aria-label="Jumlah"
            className="h-9 w-10 border-x border-line bg-transparent text-center tabular-nums outline-none"
          />
          <button type="button" onClick={() => onChange({ qty: Math.min(50, line.qty + 1) })} aria-label="Tambah" className="h-9 w-9 text-lg">+</button>
        </div>
        <span aria-hidden="true">×</span>
        <div className="w-36"><MoneyInput value={line.unitPrice} onChange={(v) => onChange({ unitPrice: v })} ariaLabel="Harga satuan" compact /></div>
        <button type="button" onClick={onRemove} aria-label={`Hapus ${line.description || "layanan"}`} className="ml-auto flex h-9 w-9 items-center justify-center text-foreground/50 hover:text-red-700">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" /></svg>
        </button>
      </div>
    </li>
  );
}

// Panel pilih layanan: bisa dicari, harga terlihat, satu ketukan langsung masuk ke daftar.
// Kalau jenis acara sudah dipilih, hanya layanan di kategori itu yang tampil (tambahan selalu tampil).
// Mengetik di kolom cari atau "Tampilkan semua" membuka seluruh price list.
function ServicePicker({ catalog, category, onPick, onClose }: { catalog: Catalog; category?: EventType; onPick: (value: string) => void; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const filtering = Boolean(category) && !showAll && !query.trim();
  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (...texts: string[]) => !q || texts.some((t) => t.toLowerCase().includes(q));
    const inCategory = (categories?: string[]) => !filtering || Boolean(category && categories?.includes(category.id));
    return [
      ...catalog.groups.map((g) => ({
        title: g.name,
        options: g.items.filter((i) => inCategory(i.categories) && match(g.name, i.name)).map((i) => ({ value: `item:${i.id}`, name: i.name, price: formatRupiah(i.price) })),
      })),
      {
        title: "Tambahan",
        options: catalog.addOns.filter((a) => match(a.name)).map((a) => ({ value: `addon:${a.id}`, name: a.name, price: `mulai ${formatRupiah(a.priceFrom)}` })),
      },
    ].filter((s) => s.options.length > 0);
  }, [catalog, query, filtering, category]);
  const hasServices = sections.some((s) => s.title !== "Tambahan");

  return (
    <div className="p-3" onKeyDown={(ev) => { if (ev.key === "Escape") { ev.preventDefault(); onClose(); } }}>
      <div className="flex items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(ev) => setQuery(ev.target.value)}
          onKeyDown={(ev) => { if (ev.key === "Enter") ev.preventDefault(); }}
          placeholder="Cari layanan…"
          aria-label="Cari layanan"
          autoFocus
          className="min-h-11 min-w-0 flex-1 border border-line bg-surface px-3 text-base outline-none focus:border-accent-strong"
        />
        <button type="button" onClick={onClose} className="min-h-11 px-3 text-sm text-foreground/70">Batal</button>
      </div>
      {category && !query.trim() && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 bg-accent-soft px-3 py-2 text-sm">
          <span>{filtering ? `Layanan untuk ${category.label}` : "Semua layanan"}</span>
          <button type="button" onClick={() => setShowAll((v) => !v)} className="min-h-9 text-accent-strong underline underline-offset-4">
            {filtering ? "Tampilkan semua" : `Hanya ${category.label}`}
          </button>
        </div>
      )}
      <div className="mt-3 max-h-80 space-y-4 overflow-y-auto">
        {filtering && !hasServices && (
          <p className="px-1 text-sm text-foreground/60">Belum ada layanan yang ditandai {category?.label}. Tandai di menu Layanan, atau pilih Tampilkan semua.</p>
        )}
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-1 text-[10px] tracking-[0.16em] text-accent-strong uppercase">{section.title}</p>
            <ul className="mt-1">
              {section.options.map((option) => (
                <li key={option.value}>
                  <button type="button" onClick={() => onPick(option.value)} className="flex min-h-11 w-full items-center justify-between gap-3 px-1 text-left text-sm hover:bg-accent-soft">
                    <span>{option.name}</span>
                    <span className="shrink-0 text-foreground/70 tabular-nums">{option.price}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {sections.length === 0 && <p className="px-1 text-sm text-foreground/60">Tidak ada layanan yang cocok.</p>}
      </div>
      <button type="button" onClick={() => onPick("custom")} className="mt-3 min-h-11 w-full border border-dashed border-line text-sm text-foreground/80 hover:bg-accent-soft">
        Isi manual (layanan di luar price list)
      </button>
    </div>
  );
}

// Input rupiah dengan titik ribuan: ketik 235000, tampil 235.000. Nilai yang dikirim tetap angka polos.
function MoneyInput({ id, name, value, onChange, invalid, ariaLabel, compact }: { id?: string; name?: string; value: number; onChange: (value: number) => void; invalid?: boolean; ariaLabel?: string; compact?: boolean }) {
  return (
    <div className={`flex items-center border bg-background focus-within:border-accent-strong ${invalid ? "border-red-600" : "border-line"} ${compact ? "h-9" : "min-h-11"}`}>
      <span className="pl-3 text-foreground/50">Rp</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={value ? value.toLocaleString("id-ID") : ""}
        placeholder="0"
        onChange={(ev) => onChange(Math.min(1_000_000_000, Number(ev.target.value.replace(/\D/g, "")) || 0))}
        aria-label={ariaLabel}
        className="h-full min-w-0 flex-1 bg-transparent px-2 text-right text-base text-foreground tabular-nums outline-none"
      />
      {name && <input type="hidden" name={name} value={value} />}
    </div>
  );
}
