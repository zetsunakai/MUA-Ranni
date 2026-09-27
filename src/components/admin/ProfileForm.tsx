"use client";

import { startTransition, useActionState, type FormEvent, type ReactNode } from "react";
import type { FormState } from "@/app/admin/actions";
import { saveProfile } from "@/app/admin/profil/actions";
import type { Profile } from "@/lib/profile";

const initialState: FormState = { status: "idle", message: "" };

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, saving] = useActionState(saveProfile, initialState);
  const e = state.fieldErrors ?? {};

  // Kirim manual supaya isian tidak di-reset kalau ada error.
  const onSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const formData = new FormData(ev.currentTarget);
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

      <Section title="Halaman Tentang">
        <Field id="greeting" label="Judul / sapaan" error={e.greeting}>
          <input id="greeting" name="greeting" defaultValue={profile.greeting} className={inputClass(e.greeting)} />
        </Field>
        <Field id="bio" label="Bio" hint="Pisahkan paragraf dengan satu baris kosong." error={e.bio}>
          <textarea id="bio" name="bio" rows={12} defaultValue={profile.bio.join("\n\n")} className={`${inputClass(e.bio)} py-2 leading-relaxed`} />
        </Field>
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <p aria-live="polite" className={`flex-1 text-sm ${state.status === "error" ? "text-red-700" : "text-foreground/80"}`}>
            {saving ? "Menyimpan…" : state.message}
          </p>
          <button
            type="submit"
            disabled={saving}
            className="h-11 rounded-full bg-accent-strong px-6 font-medium text-white hover:bg-foreground disabled:opacity-60"
          >
            Simpan
          </button>
        </div>
      </div>
    </form>
  );
}

function inputClass(error?: string) {
  return `mt-1 min-h-11 w-full rounded-lg border bg-background px-3 text-base outline-none focus:border-accent-strong ${
    error ? "border-red-600" : "border-line"
  }`;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-xl border border-line bg-surface p-4 sm:p-5">
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
