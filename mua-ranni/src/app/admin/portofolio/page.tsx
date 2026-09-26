import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { categoryLabels } from "@/data/site";
import { requireAdmin } from "@/lib/auth";
import { getPortfolioItems } from "@/lib/portfolio";

export const metadata: Metadata = { title: "Portofolio" };

const notices: Record<string, string> = {
  baru: "Foto baru sudah tampil di website.",
  edit: "Perubahan sudah tampil di website.",
  hapus: "Foto sudah dihapus dari website.",
};

export default async function AdminPortfolioPage({ searchParams }: PageProps<"/admin/portofolio">) {
  const admin = await requireAdmin();
  const [items, { disimpan }] = await Promise.all([getPortfolioItems(), searchParams]);
  const notice = typeof disimpan === "string" ? notices[disimpan] : undefined;
  const featuredCount = items.filter((i) => i.featured).length;

  return (
    <>
      <AdminHeader email={admin.email} current="/admin/portofolio" />
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-semibold">Portofolio</h1>
            <p className="mt-1 text-sm text-foreground/70">
              {items.length} foto · {featuredCount} tampil di Home
            </p>
          </div>
          <Link
            href="/admin/portofolio/baru"
            className="shrink-0 rounded-full bg-accent-strong px-5 py-3 text-sm font-medium text-white hover:bg-foreground"
          >
            + Tambah foto
          </Link>
        </div>

        {notice && (
          <p role="status" className="mt-4 rounded-lg bg-accent-soft px-4 py-3 text-sm">
            {notice}
          </p>
        )}

        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`/admin/portofolio/${item.id}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-accent-soft">
                  <Image src={item.imageUrl} alt={item.title} fill sizes="(min-width: 640px) 33vw, 50vw" className="object-cover" />
                  {item.featured && (
                    <span className="absolute left-2 top-2 rounded-full bg-accent-strong px-2 py-0.5 text-[11px] font-medium text-white">
                      Home
                    </span>
                  )}
                  {item.beforeImageUrl && (
                    <span className="absolute right-2 top-2 rounded-full bg-surface/90 px-2 py-0.5 text-[11px] font-medium">
                      Before–After
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm font-medium leading-snug group-hover:text-accent-strong">{item.title}</p>
                <p className="text-xs text-foreground/70">{categoryLabels[item.category]} · Edit</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
