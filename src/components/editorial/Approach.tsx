import { ChapterHeading } from "@/components/editorial/Editorial";

const approach = [
  { title: "Menyesuaikan wajah & busana", text: "Riasan dibuat mengikuti karakter wajah dan warna busanamu, bukan satu gaya untuk semua." },
  { title: "Datang ke tempatmu", text: "Kamu cukup bersiap di rumah, kos, atau venue." },
  { title: "Sampai hijab rapi", text: "Bulu mata dan hijab do simple sudah termasuk, jadi tampilan selesai utuh." },
];

export default function Approach() {
  return <section className="editorial-container editorial-section">
    <ChapterHeading label="Tentang" title="Cara aku merias"><p>Riasan disesuaikan dengan wajah dan busanamu, dikerjakan langsung di lokasimu.</p></ChapterHeading>
    <ol className="approach-grid">{approach.map((item, index) => <li key={item.title}>
      <div className="flex items-center justify-between border-b border-line pb-5"><span className="editorial-label">0{index + 1}</span><span aria-hidden="true" className="text-accent-strong">✧</span></div>
      <h3 className="font-heading">{item.title}</h3><p className="editorial-description">{item.text}</p>
    </li>)}</ol>
  </section>;
}
