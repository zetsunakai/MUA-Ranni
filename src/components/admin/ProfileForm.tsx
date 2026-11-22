"use client";

import { startTransition, useActionState, useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { FormState } from "@/app/admin/actions";
import { saveProfile } from "@/app/admin/profil/actions";
import { compressImage } from "@/lib/compress-image";
import type { Profile } from "@/lib/profile";
import { formatBankLines } from "@/lib/profile-format";

const initialState: FormState = { status: "idle", message: "" };

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, saving] = useActionState(saveProfile, initialState);
  const [preparing, setPreparing] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const e: Record<string, string | undefined> = { ...(state.fieldErrors ?? {}), ...(photoError ? { photo: photoError } : {}) };

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  // Kirim manual supaya isian tidak di-reset kalau ada error. Foto dikecilkan dulu di browser.
  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const formData = new FormData(ev.currentTarget);
    setPhotoError("");
    const photo = formData.get("photo");
    if (photo instanceof File && photo.size > 0) {
      setPreparing(true);
      try {
        formData.set("photo", await compressImage(photo));
      } catch {
        setPhotoError("Foto tidak bisa diproses. Coba foto lain.");
        setPreparing(false);
        return;
      }
      setPreparing(false);
    }
    startTransition(() => formAction(formData));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-28">
      <Section title="Kontak">
        <Field id="whatsapp" label="Nomor WhatsApp" hint="Semua tombol WhatsApp di website memakai nomor ini." error={e.whatsapp}>
          <input id="whatsapp" name="whatsapp" inputMode="tel" defaultValue={profile.whatsappDisplay} className={inputClass(e.whatsapp)} />
        </Field>
        <Field id="instagram" label="Instagram" hint="Username saja, tanpa @." error={e.instagram}>
          <input id="instagram" name="instagram" defaultValue={profile.instagramHandle} className={inputClass(e.instagram)} />
        </Field>
        <Field id="tiktok" label="TikTok" hint="Kosongkan kalau tidak punya; link TikTok hilang dari footer." error={e.tiktok}>
          <input id="tiktok" name="tiktok" defaultValue={profile.tiktokHandle ?? ""} className={inputClass(e.tiktok)} />
        </Field>
        <Field id="responseHours" label="Jam respon chat" error={e.responseHours}>
          <input id="responseHours" name="responseHours" defaultValue={profile.responseHours} className={inputClass(e.responseHours)} />
        </Field>
        <Field id="serviceAreas" label="Area layanan" hint="Satu area per baris." error={e.serviceAreas}>
          <textarea
            id="serviceAreas"
            name="serviceAreas"
            rows={Math.max(3, profile.serviceAreas.length)}
            defaultValue={profile.serviceAreas.join("\n")}
            className={`${inputClass(e.serviceAreas)} py-2`}
          />
        </Field>
      </Section>

      <Section title="Foto profil">
        <div className="flex flex-wrap items-end gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- pratinjau foto profil (lokal / bucket publik) */}
          <img src={preview ?? profile.photoUrl} alt="Foto profil saat ini" className="aspect-[4/5] w-32 border border-line object-cover" />
          <Field id="photo" label="Ganti foto" hint="Tampil di Home dan Tentang. Foto tegak (portrait) paling pas." error={e.photo}>
            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(ev) => {
                const f = ev.target.files?.[0];
                setPreview(f ? URL.createObjectURL(f) : null);
              }}
              className="mt-1 block w-full text-sm file:mr-3 file:min-h-11 file:border file:border-line file:bg-background file:px-4 file:text-sm"
            />
          </Field>
        </div>
      </Section>

      <Section title="Aturan booking">
        <Field id="depositInfo" label="Info DP" error={e.depositInfo}>
          <textarea id="depositInfo" name="depositInfo" rows={2} defaultValue={profile.depositInfo} className={`${inputClass(e.depositInfo)} py-2`} />
        </Field>
        <Field id="paymentInfo" label="Info pelunasan" error={e.paymentInfo}>
          <textarea id="paymentInfo" name="paymentInfo" rows={2} defaultValue={profile.paymentInfo} className={`${inputClass(e.paymentInfo)} py-2`} />
        </Field>
        <Field id="terms" label="Syarat & ketentuan" hint="Satu poin per baris." error={e.terms}>
          <textarea id="terms" name="terms" rows={Math.max(4, profile.terms.length + 1)} defaultValue={profile.terms.join("\n")} className={`${inputClass(e.terms)} py-2 leading-relaxed`} />
        </Field>
      </Section>

      <Section title="Lokasi">
        <Field id="locationName" label="Nama lokasi" hint="mis. Tonjong" error={e.locationName}>
          <input id="locationName" name="locationName" defaultValue={profile.location.name} className={inputClass(e.locationName)} />
        </Field>
        <Field id="locationAddress" label="Alamat" hint="Dipakai juga untuk peta di footer dan halaman Kontak." error={e.locationAddress}>
          <input id="locationAddress" name="locationAddress" defaultValue={profile.location.address} className={inputClass(e.locationAddress)} />
        </Field>
        <Field id="locationMapsUrl" label="Link Google Maps" hint="Opsional. Kosongkan untuk pakai pencarian alamat." error={e.locationMapsUrl}>
          <input id="locationMapsUrl" name="locationMapsUrl" type="url" defaultValue={profile.location.mapsUrl} className={inputClass(e.locationMapsUrl)} />
        </Field>
      </Section>

      <Section title="Rekening">
        <Field id="bankAccounts" label="Daftar rekening" hint="Satu rekening per baris: nama bank lalu nomor, mis. BCA 7175262261." error={e.bankAccounts}>
          <textarea id="bankAccounts" name="bankAccounts" rows={Math.max(2, profile.bankAccounts.length + 1)} defaultValue={formatBankLines(profile.bankAccounts)} className={`${inputClass(e.bankAccounts)} py-2 tabular-nums`} />
        </Field>
        <Field id="bankAccountName" label="Atas nama" error={e.bankAccountName}>
          <input id="bankAccountName" name="bankAccountName" defaultValue={profile.bankAccountName} className={inputClass(e.bankAccountName)} />
        </Field>
      </Section>

      <Section title="Halaman Tentang">
        <Field id="greeting" label="Judul / sapaan" error={e.greeting}>
          <input id="greeting" name="greeting" defaultValue={profile.greeting} className={inputClass(e.greeting)} />
        </Field>
        <Field id="bio" label="Bio" hint="Pisahkan paragraf dengan satu baris kosong." error={e.bio}>
          <textarea id="bio" name="bio" rows={12} defaultValue={profile.bio.join("\n\n")} className={`${inputClass(e.bio)} py-2 leading-relaxed`} />
        </Field>
      </Section>

      <div className="admin-savebar fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <p aria-live="polite" className={`flex-1 text-sm ${state.status === "error" ? "text-red-700" : "text-foreground/80"}`}>
            {preparing ? "Mengecilkan foto…" : saving ? "Menyimpan…" : photoError || state.message}
          </p>
          <button
            type="submit"
            disabled={saving || preparing}
            className="h-11 rounded-none bg-foreground px-6 font-medium text-white hover:bg-foreground disabled:opacity-60"
          >
            Simpan
          </button>
        </div>
      </div>
    </form>
  );
}

function inputClass(error?: string) {
  return `mt-1 min-h-11 w-full rounded-none border bg-background px-3 text-base outline-none focus:border-accent-strong ${
    error ? "border-red-600" : "border-line"
  }`;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-none border border-line bg-surface p-4 sm:p-5">
      <h2 className="font-heading text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {hint && <p className="text-xs text-foreground/70">{hint}</p>}
      {children}
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
