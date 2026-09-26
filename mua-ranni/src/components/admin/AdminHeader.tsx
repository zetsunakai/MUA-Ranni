import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { site } from "@/data/site";

const tabs = [
  { href: "/admin/jadwal", label: "Jadwal" },
  { href: "/admin/harga", label: "Harga" },
  { href: "/admin/portofolio", label: "Portofolio" },
  { href: "/admin/testimoni", label: "Testimoni" },
] as const;

type Props = { email: string; current: (typeof tabs)[number]["href"] };

export default function AdminHeader({ email, current }: Props) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="font-heading text-lg font-semibold leading-tight">{site.name}</p>
          <p className="truncate text-xs text-foreground/70">Admin · {email}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/layanan" target="_blank" className="rounded-full border border-line px-3 py-2 text-sm">
            Lihat situs
          </Link>
          <form action={logout}>
            <button type="submit" className="rounded-full px-3 py-2 text-sm text-accent-strong">
              Keluar
            </button>
          </form>
        </div>
      </div>
      <nav aria-label="Menu admin" className="mx-auto flex max-w-3xl gap-1 px-4">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={tab.href === current ? "page" : undefined}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              tab.href === current ? "border-accent-strong text-accent-strong" : "border-transparent text-foreground/70"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
