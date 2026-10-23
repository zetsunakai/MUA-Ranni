import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import { bookingFormUrl } from "@/lib/whatsapp";
import type { ServiceGroup } from "@/types";

export function ServiceSuite({ group }: { group: ServiceGroup }) {
  const from = group.items.length ? Math.min(...group.items.map(i => i.price)) : null;
  return <article id={group.id} className={`service-suite ${group.tier === "premium" ? "service-suite-premium" : ""}`}>
    <h3 className="font-heading">{group.name}</h3>
    <p className="suite-includes">Termasuk: {group.includes.join(" · ")}</p>
    {from !== null && <div className="suite-price"><span className="editorial-label">mulai · per orang</span><p className="font-heading">{formatRupiah(from)}</p></div>}
    <ul className="suite-services">{group.items.map(item => <li key={item.id}>
      <Link href={bookingFormUrl("layanan", { service: `${group.name} — ${item.name} (${formatRupiah(item.price)})` })} aria-label={`Booking ${item.name}, ${formatRupiah(item.price)}, lewat WhatsApp`}>
        <span>{item.name}</span><span>{formatRupiah(item.price)}</span>
      </Link>
    </li>)}</ul>
    <Link href={bookingFormUrl("layanan", { service: group.name })} className={`editorial-button ${group.tier === "premium" ? "editorial-button-primary" : "editorial-button-outline"}`}>Pilih paket →</Link>
  </article>;
}

export function ServiceComparison({ groups }: { groups: ServiceGroup[] }) {
  if (!groups.length) return null;
  const includes = [...new Set(groups.flatMap(g => g.includes))];
  return <div className="comparison-scroll" role="region" aria-label="Perbandingan layanan dan harga" tabIndex={0}>
    <table className="service-comparison">
      <caption className="sr-only">Layanan &amp; Harga — Termasuk</caption>
      <thead><tr><th scope="col">Termasuk</th>{groups.map(g => <th key={g.id} scope="col">{g.name}</th>)}</tr></thead>
      <tbody>{includes.map(include => <tr key={include}><th scope="row">{include}</th>{groups.map(g => <td key={g.id}>
        <span aria-label={g.includes.includes(include) ? "Termasuk" : "Tidak termasuk"}>{g.includes.includes(include) ? "✓" : "—"}</span>
      </td>)}</tr>)}
        <tr><th scope="row">Harga mulai dari, per orang.</th>{groups.map(g => <td key={g.id}>{g.items.length ? formatRupiah(Math.min(...g.items.map(i => i.price))) : "—"}</td>)}</tr>
      </tbody>
    </table>
  </div>;
}
