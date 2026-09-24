import Link from "next/link";
import { site } from "@/data/site";
import { whatsappUrl } from "@/lib/whatsapp";

// Placeholder sementara. Home lengkap (hero, portofolio pilihan, paket, testimoni) dibuat di Minggu 4.
export default function Home() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-start justify-center gap-6 px-4 py-20 sm:px-6">
      <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-strong">
        {site.serviceAreas.join(" · ")}
      </span>
      <h1 className="max-w-2xl font-heading text-4xl font-semibold leading-tight sm:text-5xl">
        Riasan yang tetap flawless dari akad sampai foto terakhir.
      </h1>
      <p className="max-w-xl text-foreground/75">{site.tagline}.</p>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link
          href="/portfolio"
          className="rounded-full border border-line bg-surface px-6 py-3 text-center font-medium transition-colors hover:border-accent"
        >
          Lihat portofolio
        </Link>
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-accent-strong px-6 py-3 text-center font-medium text-white transition-colors hover:bg-foreground"
        >
          Chat WhatsApp
        </a>
      </div>
    </section>
  );
}
