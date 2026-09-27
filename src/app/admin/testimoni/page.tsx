import type { Metadata } from "next";
import AdminHeader from "@/components/admin/AdminHeader";
import ConfirmButton from "@/components/admin/ConfirmButton";
import InviteCreator from "@/components/admin/InviteCreator";
import { site } from "@/data/site";
import { getCategories, labelOf } from "@/lib/categories";
import { requireAdmin } from "@/lib/auth";
import { getTestimonialAdminData } from "@/lib/testimonials";
import { deleteInvite, moderateTestimonial } from "./actions";

export const metadata: Metadata = { title: "Testimoni" };

const dateFormat = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });

export default async function AdminTestimoniPage() {
  const admin = await requireAdmin();
  const [data, categories] = await Promise.all([getTestimonialAdminData(), getCategories()]);

  return (
    <>
      <AdminHeader email={admin.email} current="/admin/testimoni" />
      <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-6">
        <div>
          <h1 className="font-heading text-4xl">Testimoni</h1>
          <p className="mt-1 text-sm text-foreground/70">
            Hanya testimoni yang disetujui yang tampil di Home.
          </p>
        </div>

        {!data ? (
          <p className="rounded-lg border border-line bg-surface p-4 text-sm">Database belum disambungkan.</p>
        ) : (
          <>
            <InviteCreator categories={categories} />

            <section>
              <h2 className="font-heading text-2xl">
                Menunggu persetujuan <span className="text-foreground/70">({data.pending.length})</span>
              </h2>
              {data.pending.length === 0 ? (
                <p className="mt-2 text-sm text-foreground/70">Belum ada testimoni baru.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {data.pending.map((t) => (
                    <li key={t.id} className="rounded-xl border border-accent bg-surface p-4">
                      <form action={moderateTestimonial} className="space-y-3">
                        <input type="hidden" name="id" value={t.id} />
                        <div className="flex items-start gap-3">
                          {t.photoUrl && (
                            <a href={t.photoUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
                              {/* Foto dari klien, belum tentu disetujui; tidak lewat next/image. */}
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={t.photoUrl} alt={`Foto dari ${t.clientName}`} className="h-24 w-20 rounded-lg object-cover" />
                            </a>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-foreground/70">
                              {labelOf(categories, t.eventType)} · dikirim {dateFormat.format(t.createdAt)}
                            </p>
                            <label className="mt-1 block text-xs text-foreground/70">
                              <span>Nama</span>
                              <input
                                name="clientName"
                                defaultValue={t.clientName}
                                maxLength={60}
                                className="mt-0.5 w-full rounded-lg border border-line bg-background px-2 py-1.5 text-base text-foreground outline-none focus:border-accent-strong"
                              />
                            </label>
                          </div>
                        </div>
                        <label className="block text-xs text-foreground/70">
                          <span>Ulasan (boleh perbaiki typo sebelum disetujui)</span>
                          <textarea
                            name="quote"
                            defaultValue={t.quote}
                            maxLength={500}
                            rows={4}
                            className="mt-0.5 w-full rounded-lg border border-line bg-background px-2 py-1.5 text-base text-foreground outline-none focus:border-accent-strong"
                          />
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <ConfirmButton
                            name="intent"
                            value="approve"
                            pendingLabel="Menyimpan…"
                            className="rounded-full bg-accent-strong px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
                          >
                            Setujui & tampilkan
                          </ConfirmButton>
                          <ConfirmButton
                            name="intent"
                            value="delete"
                            confirmMessage={`Tolak dan hapus testimoni dari ${t.clientName}? Tidak bisa dikembalikan.`}
                            className="rounded-full border border-red-300 px-5 py-2 text-sm text-red-700 disabled:opacity-60"
                          >
                            Tolak
                          </ConfirmButton>
                        </div>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="font-heading text-2xl">
                Tampil di website <span className="text-foreground/70">({data.approved.length})</span>
              </h2>
              {data.approved.length === 0 ? (
                <p className="mt-2 text-sm text-foreground/70">Belum ada. Section testimoni di Home muncul otomatis begitu ada yang disetujui.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {data.approved.map((t) => (
                    <li key={t.id} className="rounded-xl border border-line bg-surface p-4">
                      <p className="text-sm text-foreground/80">“{t.quote}”</p>
                      <p className="mt-2 text-xs">
                        <span className="font-semibold">{t.clientName}</span>
                        <span className="text-foreground/70"> · {labelOf(categories, t.eventType)}{t.photoUrl ? " · dengan foto" : ""}</span>
                      </p>
                      <form action={moderateTestimonial} className="mt-3 flex flex-wrap gap-2">
                        <input type="hidden" name="id" value={t.id} />
                        <ConfirmButton name="intent" value="hide" pendingLabel="Menyembunyikan…" className="rounded-full border border-line px-4 py-1.5 text-sm">
                          Sembunyikan
                        </ConfirmButton>
                        <ConfirmButton
                          name="intent"
                          value="delete"
                          confirmMessage={`Hapus testimoni dari ${t.clientName} secara permanen?`}
                          className="rounded-full border border-red-300 px-4 py-1.5 text-sm text-red-700"
                        >
                          Hapus
                        </ConfirmButton>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {data.openInvites.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl">
                  Link belum diisi <span className="text-foreground/70">({data.openInvites.length})</span>
                </h2>
                <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
                  {data.openInvites.map((inv) => (
                    <li key={inv.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{inv.clientName}</p>
                        <p className="truncate font-mono text-xs text-foreground/70">
                          {site.url}/testimoni/{inv.id}
                        </p>
                        <p className="text-xs text-foreground/70">berlaku sampai {dateFormat.format(inv.expiresAt)}</p>
                      </div>
                      <form action={deleteInvite}>
                        <input type="hidden" name="id" value={inv.id} />
                        <ConfirmButton
                          confirmMessage={`Batalkan link untuk ${inv.clientName}? Link tidak bisa dipakai lagi.`}
                          className="rounded-full px-3 py-1.5 text-sm text-red-700"
                        >
                          Batalkan
                        </ConfirmButton>
                      </form>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}
