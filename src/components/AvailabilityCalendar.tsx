"use client";

import { useId, useState, useSyncExternalStore } from "react";
import MonthCalendar from "@/components/MonthCalendar";
import { addMonths, PAST_BOOKING_DATE_MESSAGE, todayInJakarta, type ScheduleStatus } from "@/lib/dates";
import { bookingFormUrl } from "@/lib/whatsapp";

type Props = {
  statuses: Record<string, ScheduleStatus>;
  monthsAhead: number;
  renderedToday: string;
  footnote: string;
};

const subscribe = () => () => {};

export default function AvailabilityCalendar({ statuses, monthsAhead, renderedToday, footnote }: Props) {
  // Halaman ini statis: "hari ini" versi server bisa sudah basi (dibuat kemarin).
  // useSyncExternalStore memakai nilai server saat hydration (tanpa mismatch),
  // lalu langsung memakai tanggal WIB dari browser.
  const today = useSyncExternalStore(subscribe, todayInJakarta, () => renderedToday);
  const minMonth = today.slice(0, 7);
  const [month, setMonth] = useState(minMonth);
  const [selected, setSelected] = useState<string | null>(null);

  // Isi form. Tanggal otomatis terisi saat tanggal di kalender diketuk, tapi tetap bisa diketik.
  const [dateText, setDateText] = useState("");
  const [dateError, setDateError] = useState("");
  const [time, setTime] = useState("");
  const id = useId();

  function selectDate(date: string) {
    setSelected(date);
    setDateText(date);
  }

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

      <div
        aria-labelledby={`${id}-title`}
        className="flex flex-col gap-5 rounded-lg bg-accent-soft p-5 sm:p-8 lg:p-10"
      >
        <h2 id={`${id}-title`} className="font-heading text-[32px] leading-none md:text-4xl">
          Kunci tanggal
        </h2>

        <div className="flex flex-col gap-1.5 md:gap-2">
          <label htmlFor={`${id}-date`} className="text-[13px] font-medium md:text-sm">
            Tanggal acara
          </label>
          <input
            id={`${id}-date`}
            type="date"
            min={today}
            value={dateText}
            onChange={(e) => {
              const value = e.target.value;
              if (value && value < today) {
                setDateText("");
                setSelected(null);
                setDateError(PAST_BOOKING_DATE_MESSAGE);
                return;
              }
              setDateText(value);
              setSelected(value || null);
              setDateError("");
            }}
            placeholder="Pilih di kalender"
            className={fieldClass}
          />
          {dateError && <p role="alert" className="text-sm text-red-700">{dateError}</p>}
          {limited && (
            <p className="text-[13px] text-accent-strong">Slot di tanggal ini tinggal sedikit, sebaiknya chat secepatnya.</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 md:gap-2">
          <label htmlFor={`${id}-time`} className="text-[13px] font-medium md:text-sm">
            Jam makeup
          </label>
          <input
            id={`${id}-time`}
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={fieldClass}
          />
        </div>

        <a
          href={bookingFormUrl("jadwal", { date: dateText, time })}
          className="mt-1 rounded-full bg-accent-strong px-6 py-4 text-center font-medium text-white transition-colors hover:bg-foreground md:py-[18px]"
        >
          Lanjut isi formulir booking
        </a>

        <p className="text-xs leading-relaxed text-muted md:text-[13px]">{footnote}</p>
      </div>
    </div>
  );
}
