import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { site } from "@/data/site";

export default function AdminHeader({ email }: { email: string }) {
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
    </header>
  );
}
