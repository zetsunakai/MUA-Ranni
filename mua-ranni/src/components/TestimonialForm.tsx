"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import type { FormState } from "@/app/admin/actions";
import { submitTestimonial } from "@/app/(site)/testimoni/actions";
import { compressImage } from "@/lib/compress-image";
import type { Category, CategoryOption } from "@/types";

const initialState: FormState = { status: "idle", message: "" };

type Props = { token: string; clientName: string; eventType: Category | null; categories: CategoryOption[] };

export default function TestimonialForm({ token, clientName, eventType, categories }: Props) {
  const [state, formAction, sending] = useActionState(submitTestimonial, initialState);
  const [compressing, setCompressing] = useState(false);
  const [preview, setPreview] = useState<string>();
  const [clientError, setClientError] = useState("");
  const errors = state.fieldErrors ?? {};

  if (state.status === "success") return <ThankYou message={state.message} />;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setClientError("");
    const formData = new FormData(e.currentTarget);
    const photo = formData.get("photo");
    if (photo instanceof File && photo.size > 0) {
      try {
        setCompressing(true);
        formData.set("photo", await compressImage(photo));
      } catch {
        setClientError("Foto tidak bisa dibaca. Coba foto lain, atau kirim tanpa foto.");
        return;
      } finally {
        setCompressing(false);
      }
    }
    startTransition(() => formAction(formData));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input type="hidden" name="token" value={token} />

      {/* Honeypot: tersembunyi dari manusia dan pembaca layar, biasanya diisi bot. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label htmlFor="clientName" className="text-sm font-medium">
          Nama yang ditampilkan
        </label>
        <input id="clientName" name="clientName" defaultValue={clientName} maxLength={60} required className={inputClass(errors.clientName)} />
        <p className="mt-1 text-xs text-foreground/70">Boleh nama panggilan saja.</p>
        <FieldError message={errors.clientName} />
      </div>

      <div>
        <label htmlFor="eventType" className="text-sm font-medium">
          Jenis acara
        </label>
        <select id="eventType" name="eventType" defaultValue={eventType ?? ""} required className={inputClass(errors.eventType)}>
          <option value="" disabled>
            Pilih jenis acara
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <FieldError message={errors.eventType} />
      </div>

      <div>
        <label htmlFor="quote" className="text-sm font-medium">
          Ulasan
        </label>
        <textarea
          id="quote"
          name="quote"
          rows={5}
          minLength={10}
          maxLength={500}
          required
          placeholder="contoh: Makeup-nya awet dari pagi sampai malam, hasilnya natural di foto…"
          className={inputClass(errors.quote)}
        />
        <FieldError message={errors.quote} />
      </div>

      <div>
        <p className="text-sm font-medium">
          Foto <span className="font-normal text-foreground/70">(opsional)</span>
        </p>
        <label className="mt-1 flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-line bg-surface p-3">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent-soft text-xs text-foreground/70">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : "Foto"}
          </span>
          <span className="text-sm">
            <span className="font-medium text-accent-strong">{preview ? "Ganti foto" : "Pilih foto hasil makeup"}</span>
            <span className="block text-xs text-foreground/70">Dari galeri HP. Otomatis dikecilkan.</span>
          </span>
          <input
            type="file"
            name="photo"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : undefined);
            }}
          />
        </label>
        <FieldError message={errors.photo} />
      </div>

      <div className="space-y-3 rounded-xl border border-line bg-surface p-4 text-sm">
        <label className="flex items-start gap-3">
          <input type="checkbox" name="consent" required className="mt-0.5 h-5 w-5 shrink-0 accent-accent-strong" />
          <span>Saya mengizinkan nama dan ulasan ini ditampilkan di website dan media sosial Ranni.</span>
        </label>
        <FieldError message={errors.consent} />
        {preview && (
          <>
            <label className="flex items-start gap-3">
              <input type="checkbox" name="photoConsent" className="mt-0.5 h-5 w-5 shrink-0 accent-accent-strong" />
              <span>Saya mengizinkan foto ini (termasuk wajah saya) ditampilkan.</span>
            </label>
            <FieldError message={errors.photoConsent} />
          </>
        )}
      </div>

      <p aria-live="polite" className="min-h-5 text-sm text-red-700">
        {clientError || (state.status === "error" ? state.message : "")}
      </p>

      <button
        type="submit"
        disabled={sending || compressing}
        className="w-full rounded-full bg-accent-strong py-3 font-medium text-white transition-colors hover:bg-foreground disabled:opacity-60"
      >
        {compressing ? "Mengecilkan foto…" : sending ? "Mengirim…" : "Kirim testimoni"}
      </button>
    </form>
  );
}

function inputClass(error?: string) {
  return `mt-1 w-full rounded-lg border bg-surface px-3 py-3 text-base outline-none focus:border-accent-strong ${
    error ? "border-red-600" : "border-line"
  }`;
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-red-700">{message}</p> : null;
}

// Setelah kirim, form menyusut dan layar HP masih di posisi tombol Kirim (bawah),
// jadi pesan ini digulir ke tengah layar dan diberi fokus supaya pasti terlihat.
function ThankYou({ message }: { message: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    ref.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div ref={ref} tabIndex={-1} role="status" className="rounded-xl bg-accent-soft p-6 text-center outline-none">
      <p className="font-heading text-2xl font-semibold">Terima kasih! 💕</p>
      <p className="mt-2 text-foreground/80">{message}</p>
    </div>
  );
}
