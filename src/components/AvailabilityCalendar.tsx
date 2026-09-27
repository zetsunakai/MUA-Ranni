"use client";

import { useId, useState, useSyncExternalStore } from "react";
import MonthCalendar from "@/components/MonthCalendar";
import { addMonths, formatLongDate, todayInJakarta, type ScheduleStatus } from "@/lib/dates";
import { whatsappUrl } from "@/lib/whatsapp";
import type { CategoryOption } from "@/types";

type Props = {
  statuses: Record<string, ScheduleStatus>;
  monthsAhead: number;
  renderedToday: string;
  // Pilihan "Jenis acara" diambil dari kategori portofolio yang dikelola admin.
  eventTypes: CategoryOption[];
  footnote: string;
};

const subscribe = () => () => {};

export default function AvailabilityCalendar({ statuses, monthsAhead, renderedToday, eventTypes, footnote }: Props) {
  // Halaman ini statis: "hari ini" versi server bisa sudah basi (dibuat kemarin).
  // useSyncExternalStore memakai nilai server saat hydration (tanpa mismatch),
  // lalu langsung memakai tanggal WIB dari browser.
  const today = useSyncExternalStore(subscribe, todayInJakarta, () => renderedToday);
  const minMonth = today.slice(0, 7);
  const [month, setMonth] = useState(minMonth);
  const [selected, setSelected] = useState<string | null>(null);

  // Isi form. Tanggal otomatis terisi saat tanggal di kalender diketuk, tapi tetap bisa diketik.
  const [dateText, setDateText] = useState("");
  const [eventType, setEventType] = useState("");
  const [location, setLocation] = useState("");
  const [people, setPeople] = useState("1");
  const id = useId();

  function selectDate(date: string) {
    setSelected(date);
    setDateText(formatLongDate(date));
  }

  const details = [
    dateText.trim() && `Tanggal: ${dateText.trim()}`,
    eventType && `Acara: ${eventType}`,
    location.trim() && `Lokasi: ${location.trim()}`,
    people.trim() && `Jumlah orang: ${people.trim()}`,
  ].filter(Boolean);
  const message = details.length
    ? `Halo Kak, saya mau booking makeup.\n\n${details.join("\n")}\n\nApakah tanggalnya masih tersedia?`
    : "Halo Kak, saya mau cek jadwal makeup yang masih kosong.";

  const limited = selected && statuses[selected] === "limited";
  const fieldClass =
    "w-full rounded-md border border-field bg-white px-3.5 py-3.5 text-base text-foreground placeholder:text-muted/80 md:px-4";

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-12">
      <MonthCalendar
        month={month}
        minMonth={minMonth}
        maxMonth={addMonths(minMonth, monthsAhead)}
        onMonthChange={setMonth}
        today={today}
        statuses={statuses}
        selected={selected}
        onSelect={selectDate}
      />

      <form
        onSubmit={(e) => e.preventDefault()}
        aria-labelledby={`${id}-title`}
        className="flex flex-col gap-5 rounded-lg bg-accent-soft p-5 sm:p-8 lg:p-10"
      >
        <h2 id={`${id}-title`} className="font-heading text-[32px] leading-none md:text-4xl">
          Kirim detail acara
        </h2>

        <div className="flex flex-col gap-1.5 md:gap-2">
          <label htmlFor={`${id}-date`} className="text-[13px] font-medium md:text-sm">
            Tanggal acara
          </label>
          <input
            id={`${id}-date`}
            type="text"
            value={dateText}
            onChange={(e) => setDateText(e.target.value)}
            placeholder="Pilih di kalender"
            className={fieldClass}
          />
          {limited && (
            <p className="text-[13px] text-accent-strong">Slot di tanggal ini tinggal sedikit, sebaiknya chat secepatnya.</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 md:gap-2">
          <label htmlFor={`${id}-event`} className="text-[13px] font-medium md:text-sm">
            Jenis acara
          </label>
          <div className="relative">
            <select
              id={`${id}-event`}
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className={`${fieldClass} appearance-none pr-10 ${eventType ? "" : "text-muted"}`}
            >
              <option value="">Pilih jenis acara</option>
              {eventTypes.map((c) => (
                <option key={c.id} value={c.label}>
                  {c.label}
                </option>
              ))}
              <option value="Lainnya">Lainnya</option>
            </select>
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 md:gap-2">
          <label htmlFor={`${id}-location`} className="text-[13px] font-medium md:text-sm">
            Lokasi
          </label>
          <input
            id={`${id}-location`}
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Contoh: Margonda, Depok"
            autoComplete="address-level2"
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1.5 md:gap-2">
          <label htmlFor={`${id}-people`} className="text-[13px] font-medium md:text-sm">
            Jumlah orang
          </label>
          <input
            id={`${id}-people`}
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            className={fieldClass}
          />
        </div>

        <a
          href={whatsappUrl("jadwal", message)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 rounded-full bg-accent-strong px-6 py-4 text-center font-medium text-white transition-colors hover:bg-foreground md:py-[18px]"
        >
          Kirim ke WhatsApp
        </a>

        <p className="text-xs leading-relaxed text-muted md:text-[13px]">{footnote}</p>
      </form>
    </div>
  );
}
