"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { PAST_BOOKING_DATE_MESSAGE, todayInJakarta } from "@/lib/dates";
import { isGoogleMapsUrl } from "@/lib/maps";
import { bookingMessage, isWhatsAppSource, whatsappUrl } from "@/lib/whatsapp";
import type { CategoryOption } from "@/types";

type Props = {
  eventTypes: CategoryOption[];
  serviceGroups: { id: string; name: string; items: { id: string; name: string }[] }[];
};

const fieldClass =
  "w-full min-w-0 rounded-none border-0 border-b border-field bg-transparent px-0 py-3.5 text-base text-foreground placeholder:text-muted/80 focus:border-foreground focus:outline-none";
const STORAGE_KEY = "mua-ranni-booking-form";
const FORM_FIELDS = ["name", "eventType", "serviceGroup", "serviceItem", "date", "time", "location", "mapsUrl", "people", "hairdo"] as const;
const EMPTY_SERVICE_GROUPS: Props["serviceGroups"] = [];

export default function BookingForm({ eventTypes, serviceGroups = EMPTY_SERVICE_GROUPS }: Props) {
  const [dateError, setDateError] = useState("");
  const [mapsError, setMapsError] = useState("");
  const mapsInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const groupSelectRef = useRef<HTMLSelectElement>(null);
  const itemSelectRef = useRef<HTMLSelectElement>(null);
  const pendingItemRef = useRef("");
  const subscribeToGroup = useCallback((callback: () => void) => {
    const select = groupSelectRef.current;
    select?.addEventListener("change", callback);
    return () => select?.removeEventListener("change", callback);
  }, []);
  const getGroupSnapshot = useCallback(() => groupSelectRef.current?.value ?? "", []);
  const selectedGroupId = useSyncExternalStore(subscribeToGroup, getGroupSnapshot, () => "");
  const selectedGroup = serviceGroups.find((group) => group.id === selectedGroupId);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const dateField = form.elements.namedItem("date");
    if (dateField instanceof HTMLInputElement) dateField.min = todayInJakarta();

    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : {};
      const saved = parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : {};
      const params = new URLSearchParams(window.location.search);

      for (const name of ["name", "eventType", "date", "time", "location", "mapsUrl", "people", "hairdo"] as const) {
        const queryValue = name === "name" ? undefined : params.get(name)?.trim();
        const savedValue = saved[name];
        const value = queryValue || (typeof savedValue === "string" ? savedValue : "");
        if (!value) continue;

        const field = form.elements.namedItem(name);
        if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
          field.value = value;
        }
      }

      const requestedService = params.get("service")?.trim();
      const savedGroupId = typeof saved.serviceGroup === "string" ? saved.serviceGroup : "";
      const savedItemId = typeof saved.serviceItem === "string" ? saved.serviceItem : "";
      const serviceText = requestedService ?? (typeof saved.service === "string" ? saved.service : "");
      const matchedGroup = serviceText
        ? serviceGroups.find((group) => serviceText === group.name || serviceText.startsWith(`${group.name} — `))
        : serviceGroups.find((group) => group.id === savedGroupId);
      const matchedItem = matchedGroup && serviceText
        ? matchedGroup.items.find((item) => serviceText.startsWith(`${matchedGroup.name} — ${item.name}`))
        : matchedGroup?.items.find((item) => item.id === savedItemId);
      const serviceWasRequested = params.has("service");
      const restoredGroupId = matchedGroup?.id ?? (serviceWasRequested ? "" : savedGroupId);
      pendingItemRef.current = matchedItem?.id ?? (restoredGroupId === savedGroupId ? savedItemId : "");
      if (groupSelectRef.current) {
        groupSelectRef.current.value = restoredGroupId;
        groupSelectRef.current.dispatchEvent(new Event("change", { bubbles: true }));
      }
    } catch {
      // Storage may be unavailable in restricted browser contexts; the form still works.
    }
  }, [serviceGroups]);

  useEffect(() => {
    if (!itemSelectRef.current || !selectedGroupId) return;
    itemSelectRef.current.value = pendingItemRef.current;
    pendingItemRef.current = "";
    itemSelectRef.current.dispatchEvent(new Event("change", { bubbles: true }));
  }, [selectedGroupId]);

  function saveForm(event: ChangeEvent<HTMLFormElement>) {
    try {
      const formData = new FormData(event.currentTarget);
      const values = Object.fromEntries(FORM_FIELDS.map((name) => [name, String(formData.get(name) ?? "")]));
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    } catch {
      // Storage may be unavailable in restricted browser contexts; the form still works.
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const date = String(fields.get("date") ?? "");
    if (date && date < todayInJakarta()) {
      setDateError(PAST_BOOKING_DATE_MESSAGE);
      return;
    }
    setDateError("");
    const mapsUrl = String(fields.get("mapsUrl") ?? "").trim();
    if (mapsUrl && !isGoogleMapsUrl(mapsUrl)) {
      setMapsError("Gunakan link lokasi dari Google Maps, misalnya https://maps.app.goo.gl/…");
      mapsInputRef.current?.focus();
      return;
    }
    setMapsError("");
    const sourceFromUrl = new URLSearchParams(window.location.search).get("source") ?? undefined;
    const activeSource = isWhatsAppSource(sourceFromUrl) ? sourceFromUrl : "kontak";
    const message = bookingMessage({
      name: String(fields.get("name") ?? ""),
      eventType: String(fields.get("eventType") ?? ""),
      service: [
        serviceGroups.find((group) => group.id === String(fields.get("serviceGroup") ?? ""))?.name,
        selectedGroup?.items.find((item) => item.id === String(fields.get("serviceItem") ?? ""))?.name,
      ].filter(Boolean).join(" — "),
      date,
      time: String(fields.get("time") ?? ""),
      location: String(fields.get("location") ?? ""),
      mapsUrl,
      people: String(fields.get("people") ?? ""),
      hairdo: String(fields.get("hairdo") ?? ""),
      note: new URLSearchParams(window.location.search).get("note") ?? "",
    });
    window.location.assign(whatsappUrl(activeSource, message));
  }

  return (
    <form
      id="form-booking"
      ref={formRef}
      onChange={saveForm}
      onSubmit={submit}
      className="booking-form grid gap-x-6 gap-y-7 border border-line bg-surface p-5 sm:grid-cols-2 sm:p-8 md:p-10"
    >
      <div className="booking-form-intro sm:col-span-2">
        <h2 className="editorial-label">Formulir booking</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Isi detail acara. Setelah itu WhatsApp akan terbuka dengan pesan yang sudah tersusun untuk kamu.
        </p>
      </div>

      <div className="form-section-label editorial-label sm:col-span-2">Detail acara</div>
      <Field label="Nama" name="name" required autoComplete="name" placeholder="Nama kamu" />

      <label className="flex flex-col gap-1.5 text-[13px] font-medium md:gap-2 md:text-sm">
        Jenis acara
        <select name="eventType" defaultValue="" className={fieldClass}>
          <option value="">Pilih jenis acara</option>
          {eventTypes.map((eventType) => (
            <option key={eventType.id} value={eventType.label}>{eventType.label}</option>
          ))}
          <option value="Lainnya">Lainnya</option>
        </select>
      </label>

      <div className="form-section-label editorial-label sm:col-span-2">Paket &amp; Layanan</div>
      <label className="flex flex-col gap-1.5 text-[13px] font-medium md:gap-2 md:text-sm">
        Paket
        <select ref={groupSelectRef} name="serviceGroup" defaultValue="" disabled={serviceGroups.length === 0} className={fieldClass}>
          <option value="">{serviceGroups.length > 0 ? "Pilih paket" : "Paket belum tersedia"}</option>
          {serviceGroups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
        </select>
        {serviceGroups.length === 0 && (
          <span className="text-xs font-normal leading-relaxed text-muted">
            Muat ulang halaman untuk melihat pilihan paket, atau lanjutkan ke WhatsApp untuk konsultasi.
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1.5 text-[13px] font-medium md:gap-2 md:text-sm">
        Layanan
        <select
          key={selectedGroupId}
          ref={itemSelectRef}
          name="serviceItem"
          defaultValue=""
          disabled={!selectedGroup}
          className={fieldClass}
        >
          <option value="">{selectedGroup ? "Pilih layanan" : "Pilih paket terlebih dahulu"}</option>
          {selectedGroup?.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>

      <div>
        <Field
          label="Tanggal acara"
          name="date"
          type="date"
          defaultValue=""
          onInvalid={(event) => {
            event.preventDefault();
            setDateError(PAST_BOOKING_DATE_MESSAGE);
          }}
        />
        {dateError && <p role="alert" className="mt-1.5 text-sm text-red-700">{dateError}</p>}
      </div>
      <Field label="Jam makeup" name="time" type="time" defaultValue="" />
      <Field label="Jumlah orang" name="people" type="number" min={1} max={50} defaultValue="1" />

      <label className="flex flex-col gap-1.5 text-[13px] font-medium md:gap-2 md:text-sm">
        Hijab do/Hair do
        <select name="hairdo" defaultValue="" className={fieldClass}>
          <option value="">Pilih kebutuhan</option>
          <option value="Hijab do">Hijab do</option>
          <option value="Hair do">Hair do</option>
          <option value="Hijab do dan Hair do">Hijab do dan Hair do</option>
          <option value="Tidak perlu">Tidak perlu</option>
          <option value="Belum tahu, ingin konsultasi">Belum tahu, ingin konsultasi</option>
        </select>
      </label>
      <div className="min-w-0">
        <Field label="Alamat" name="location" defaultValue="" autoComplete="street-address" placeholder="Alamat lengkap lokasi makeup" />
      </div>

      <div className="min-w-0">
        <label htmlFor="booking-maps" className="flex flex-col gap-1.5 text-[13px] font-medium md:gap-2 md:text-sm">
          Link lokasi Google Maps (opsional)
          <input
            ref={mapsInputRef}
            id="booking-maps"
            name="mapsUrl"
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            placeholder="https://maps.app.goo.gl/…"
            aria-describedby={`booking-maps-hint${mapsError ? " booking-maps-error" : ""}`}
            aria-invalid={mapsError ? true : undefined}
            onChange={() => setMapsError("")}
            className={fieldClass}
          />
        </label>
        <p id="booking-maps-hint" className="mt-2 text-xs leading-relaxed text-muted">
          Pilih lokasi makeup di Google Maps, ketuk Bagikan, lalu salin dan tempel linknya di sini. Tambahkan nomor rumah atau patokan di kolom alamat.
        </p>
        {mapsError && <p id="booking-maps-error" role="alert" className="mt-1.5 text-sm text-red-700">{mapsError}</p>}
        <a
          href="https://www.google.com/maps"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-accent-strong underline underline-offset-4"
        >
          Buka Google Maps →
        </a>
      </div>

      <button
        type="submit"
        className="rounded-none bg-foreground px-6 py-4 text-center font-medium text-white transition-colors hover:bg-foreground sm:col-span-2 md:py-[18px]"
      >
        Lanjut ke WhatsApp
      </button>
      <p className="text-xs leading-relaxed text-muted sm:col-span-2">
        Pesan akan terbuka di WhatsApp. Periksa kembali lalu tekan Kirim.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  ...props
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  defaultValue?: string;
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
  min?: number | string;
  max?: number;
  onInvalid?: React.FormEventHandler<HTMLInputElement>;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] font-medium md:gap-2 md:text-sm">
      {label}
      <input name={name} required={required} className={fieldClass} {...props} />
    </label>
  );
}
