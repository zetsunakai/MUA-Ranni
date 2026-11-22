import Link from "next/link";
import type { ReactNode } from "react";
import { bookingFormUrl } from "@/lib/whatsapp";

// label tidak ditampilkan lagi (label kecil di atas judul dihapus dari seluruh situs).
export function ChapterHeading({ title, children }: { label?: string; title: ReactNode; children?: ReactNode }) {
  return <div className="chapter-heading">
    <div><h2 className="editorial-title">{title}</h2></div>
    {children && <div className="editorial-description">{children}</div>}
  </div>;
}

export function BookingCTA({ compact = false }: { compact?: boolean }) {
  return <section className={compact ? "editorial-container consultation-inline" : "consultation-band"}>
    <div className={compact ? "consultation-inner" : "editorial-container consultation-inner"}>
      <div><h2 className="editorial-title">Siap tampil <em>flawless?</em></h2>
        <p className="editorial-description">Kirim tanggal, lokasi, dan jenis acaramu. Jadwal dicek dan dibalas secepatnya.</p></div>
      <div className="flex flex-wrap gap-3">
        <Link href={bookingFormUrl("home-cta")} className="editorial-button editorial-button-primary">Chat WhatsApp</Link>
        <Link href="/jadwal" className="editorial-button editorial-button-outline">Lihat jadwal</Link>
      </div>
    </div>
  </section>;
}

export function QuotePanel({ quote, name }: { quote: string; name: string; label?: string }) {
  return <figure className="quote-panel">
    <blockquote className="font-heading">“{quote}”</blockquote>
    <p className="editorial-label">— {name}</p>
  </figure>;
}
