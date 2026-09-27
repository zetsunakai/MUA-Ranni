"use client";

import { useState, useSyncExternalStore } from "react";
import MonthCalendar from "@/components/MonthCalendar";
import { ChatIcon } from "@/components/icons";
import { addMonths, formatLongDate, todayInJakarta, type ScheduleStatus } from "@/lib/dates";
import { whatsappUrl } from "@/lib/whatsapp";

type Props = { statuses: Record<string, ScheduleStatus>; monthsAhead: number; renderedToday: string };

const subscribe = () => () => {};

export default function AvailabilityCalendar({ statuses, monthsAhead, renderedToday }: Props) {
  // Halaman ini statis: "hari ini" versi server bisa sudah basi (dibuat kemarin).
  // useSyncExternalStore memakai nilai server saat hydration (tanpa mismatch),
  // lalu langsung memakai tanggal WIB dari browser.
  const today = useSyncExternalStore(subscribe, todayInJakarta, () => renderedToday);
  const minMonth = today.slice(0, 7);
  const [month, setMonth] = useState(minMonth);
  const [selected, setSelected] = useState<string | null>(null);
  const status = selected ? statuses[selected] : undefined;

  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,26rem)_1fr] md:items-start">
      <MonthCalendar
        month={month}
        minMonth={minMonth}
        maxMonth={addMonths(minMonth, monthsAhead)}
        onMonthChange={setMonth}
        today={today}
        statuses={statuses}
        selected={selected}
        onSelect={setSelected}
      />

      <div aria-live="polite" className="rounded-xl bg-accent-soft p-5">
        {selected ? (
          <>
            <p className="text-sm text-foreground/75">Tanggal dipilih</p>
            <p className="font-heading text-3xl">{formatLongDate(selected)}</p>
            <p className="mt-2 text-sm text-foreground/80">
              {status === "limited"
                ? "Slot di tanggal ini tinggal sedikit. Chat dulu untuk cek jam yang masih kosong."
                : "Tanggal ini masih tersedia."}
            </p>
            <a
              href={whatsappUrl(
                "jadwal",
                `Halo Kak, saya mau booking makeup untuk tanggal ${formatLongDate(selected)}. Apakah masih tersedia? Acaranya ... di ...`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-accent-strong px-5 py-3 font-medium text-white transition-colors hover:bg-foreground"
            >
              <ChatIcon />
              Booking tanggal ini
            </a>
          </>
        ) : (
          <>
            <p className="font-heading text-2xl">Pilih tanggal acaramu</p>
            <p className="mt-2 text-sm text-foreground/80">
              Ketuk tanggal di kalender untuk booking lewat WhatsApp. Tanggal yang dicoret sudah penuh.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
