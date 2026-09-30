"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { PAST_BOOKING_DATE_MESSAGE, todayInJakarta } from "@/lib/dates";
import { bookingMessage, isWhatsAppSource, whatsappUrl } from "@/lib/whatsapp";
import type { CategoryOption } from "@/types";

type Props = {
  eventTypes: CategoryOption[];
  serviceGroups: { id: string; name: string; items: { id: string; name: string }[] }[];
};

const fieldClass =
  "w-full rounded-md border border-field bg-white px-3.5 py-3.5 text-base text-foreground placeholder:text-muted/80 md:px-4";
const STORAGE_KEY = "mua-ranni-booking-form";
const FORM_FIELDS = ["name", "eventType", "serviceGroup", "serviceItem", "date", "time", "location", "people", "hairdo"] as const;

export default function BookingForm({ eventTypes, serviceGroups }: Props) {
  const [dateError, setDateError] = useState("");
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

      for (const name of ["name", "eventType", "date", "time", "location", "people", "hairdo"] as const) {
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
      className="grid gap-5 rounded-lg bg-accent-soft p-5 sm:grid-cols-2 sm:p-8 md:p-10"
    >
      <div className="sm:col-span-2">
        <h2 className="font-heading text-[32px] leading-none md:text-4xl">Formulir booking</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Isi detail acara. Setelah itu WhatsApp akan terbuka dengan pesan yang sudah tersusun untuk kamu.
        </p>
      </div>

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

      <label className="flex flex-col gap-1.5 text-[13px] font-medium md:gap-2 md:text-sm">
        Paket
        <select ref={groupSelectRef} name="serviceGroup" defaultValue="" className={fieldClass}>
          <option value="">Pilih paket</option>
          {serviceGroups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
        </select>
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
      <div className="sm:col-span-2">
        <Field label="Alamat" name="location" defaultValue="" autoComplete="street-address" placeholder="Alamat lengkap lokasi makeup" />
      </div>

      <button
        type="submit"
        className="rounded-full bg-accent-strong px-6 py-4 text-center font-medium text-white transition-colors hover:bg-foreground sm:col-span-2 md:py-[18px]"
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
