import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { site } from "@/data/site";

const tabs = [
  { href: "/admin", label: "Ringkasan", icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" },
  { href: "/admin/jadwal", label: "Jadwal", icon: "M4 5h16v16H4zM8 2v6M16 2v6M4 11h16" },
  { href: "/admin/layanan", label: "Layanan", icon: "M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6" },
  { href: "/admin/portofolio", label: "Portofolio", icon: "M3 3h18v18H3zM3 17l6-6 4 4 3-3 5 5M15 7h.01" },
  { href: "/admin/testimoni", label: "Testimoni", icon: "M4 4h16v12H9l-5 5zM8 8h8M8 12h5" },
  { href: "/admin/profil", label: "Profil", icon: "M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M4 21v-2a8 8 0 0 1 16 0v2" },
] as const;

type Props = { email: string; current: (typeof tabs)[number]["href"] };

export default function AdminHeader({ email, current }: Props) {
  return (
    <header className="admin-header border-b border-line bg-background">
      <div className="admin-brand px-5 py-6">
        <p className="mb-3 text-[9px] tracking-[0.22em] text-accent-strong uppercase">Admin</p>
        <Link href="/admin" className="font-heading text-[25px] leading-tight">{site.name}</Link>
      </div>
      <nav aria-label="Menu admin" className="admin-nav scrollbar-none flex gap-1 overflow-x-auto px-4 pb-3">
        {tabs.map((tab) => (
          <Link key={tab.href} href={tab.href} aria-current={tab.href === current ? "page" : undefined}
            className={`flex min-h-12 shrink-0 items-center gap-3 px-4 py-3 text-[10px] tracking-[0.12em] whitespace-nowrap uppercase transition-colors ${
              tab.href === current ? "bg-foreground text-background" : "text-muted hover:bg-accent-soft hover:text-foreground"
            }`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d={tab.icon} /></svg>
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className="admin-account flex items-center justify-between gap-4 border-t border-line px-5 py-4">
        <p className="min-w-0 truncate text-xs text-muted">{email}</p>
        <form action={logout}><button type="submit" className="min-h-11 text-xs text-accent-strong">Keluar</button></form>
      </div>
      <div className="admin-topbar flex items-center justify-between gap-4 border-t border-line px-5 py-3">
        <span className="text-[10px] tracking-[0.16em] text-muted uppercase">{tabs.find((tab) => tab.href === current)?.label}</span>
        <Link href="/" target="_blank" rel="noopener noreferrer" className="border border-line px-4 py-2.5 text-[10px] tracking-[0.1em] uppercase hover:bg-accent-soft">Lihat situs ↗</Link>
      </div>
    </header>
  );
}
