"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import type { FormState } from "@/app/admin/actions";
import { savePortfolioItem } from "@/app/admin/portofolio/actions";
import { compressImage } from "@/lib/compress-image";
import type { CategoryOption, PortfolioItem } from "@/types";

const initialState: FormState = { status: "idle", message: "" };

type Props = { item?: PortfolioItem; categories: CategoryOption[] };

export default function PortfolioForm({ item, categories }: Props) {
  const [state, formAction, saving] = useActionState(savePortfolioItem, initialState);
  const [compressing, setCompressing] = useState(false);
  const [clientError, setClientError] = useState("");
  const errors = state.fieldErrors ?? {};
  const busy = saving || compressing;

  // Foto dikompres dulu di browser, baru dikirim ke Server Action.
  // Dikirim manual (bukan <form action>) supaya isian tidak di-reset kalau ada error.
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setClientError("");
    const formData = new FormData(e.currentTarget);
    try {
      setCompressing(true);
      for (const name of ["image", "beforeImage"]) {
        const file = formData.get(name);
        if (file instanceof File && file.size > 0) formData.set(name, await compressImage(file));
      }
    } catch {
      setClientError("Foto tidak bisa dibaca. Coba pilih foto lain (JPG atau PNG).");
      return;
    } finally {
      setCompressing(false);
    }
    startTransition(() => formAction(formData));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 pb-28">
      {item && <input type="hidden" name="id" value={item.id} />}

      <PhotoField
        name="image"
        label="Foto utama"
        hint="Foto hasil makeup. Otomatis dikecilkan sebelum di-upload."
        currentUrl={item?.imageUrl}
        error={errors.image}
        required={!item}
      />

      <div>
        <label htmlFor="title" className="text-sm font-medium">
          Judul
        </label>
        <input
          id="title"
          name="title"
          defaultValue={item?.title}
          maxLength={80}
          required
          placeholder="contoh: Akad Adat Sunda Siger"
          className={inputClass(errors.title)}
        />
        <FieldError message={errors.title} />
      </div>

      <div>
        <label htmlFor="category" className="text-sm font-medium">
          Kategori
        </label>
        <select id="category" name="category" defaultValue={item?.category ?? ""} required className={inputClass(errors.category)}>
          <option value="" disabled>
            Pilih kategori
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <FieldError message={errors.category} />
      </div>

      <div>
        <label htmlFor="description" className="text-sm font-medium">
          Deskripsi <span className="font-normal text-foreground/70">(opsional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={item?.description}
          maxLength={300}
          rows={3}
          placeholder="contoh: Riasan akad dengan siger, tahan sampai resepsi."
          className={inputClass(errors.description)}
        />
        <FieldError message={errors.description} />
      </div>

      <label className="flex items-start gap-3 rounded-none border border-line bg-surface p-4">
        <input type="checkbox" name="featured" defaultChecked={item?.featured} className="mt-0.5 h-5 w-5 accent-accent-strong" />
        <span>
          <span className="block text-sm font-medium">Tampilkan di Home</span>
          <span className="block text-xs text-foreground/70">Home menampilkan 6 foto pilihan terbaru.</span>
        </span>
      </label>

      <details className="rounded-none border border-line bg-surface p-4" open={Boolean(item?.beforeImageUrl)}>
        <summary className="cursor-pointer text-sm font-medium">Foto sebelum makeup (opsional)</summary>
        <div className="mt-4 space-y-3">
          <PhotoField
            name="beforeImage"
            label="Foto sebelum"
            hint="Sudut dan cahaya sebaiknya sama dengan foto utama, supaya slider sebelum-sesudah terlihat rapi."
            currentUrl={item?.beforeImageUrl}
            error={errors.beforeImage}
          />
          {item?.beforeImageUrl && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="removeBefore" className="h-4 w-4 accent-accent-strong" />
              Hapus foto sebelum
            </label>
          )}
        </div>
      </details>

      <div className="admin-savebar fixed inset-x-0 bottom-0 border-t border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <p aria-live="polite" className={`flex-1 text-sm ${state.status === "error" || clientError ? "text-red-700" : "text-foreground/80"}`}>
            {compressing ? "Mengecilkan foto…" : saving ? "Menyimpan…" : clientError || state.message}
          </p>
          <button
            type="submit"
            disabled={busy}
            className="rounded-none bg-foreground px-6 py-3 font-medium text-white transition-colors hover:bg-foreground disabled:opacity-60"
          >
            Simpan
          </button>
        </div>
      </div>
    </form>
  );
}

function inputClass(error?: string) {
  return `mt-1 w-full rounded-none border bg-surface px-3 py-3 text-base outline-none focus:border-accent-strong ${
    error ? "border-red-600" : "border-line"
  }`;
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-red-700">{message}</p> : null;
}

type PhotoFieldProps = {
  name: string;
  label: string;
  hint: string;
  currentUrl?: string;
  error?: string;
  required?: boolean;
};

function PhotoField({ name, label, hint, currentUrl, error, required }: PhotoFieldProps) {
  const [preview, setPreview] = useState<string | undefined>(currentUrl);

  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-foreground/70">{hint}</p>
      <label
        className={`mt-2 flex cursor-pointer items-center gap-4 rounded-none border border-dashed bg-surface p-3 ${
          error ? "border-red-600" : "border-line"
        }`}
      >
        <span className="relative flex h-28 w-21 shrink-0 items-center justify-center overflow-hidden rounded-none bg-accent-soft text-xs text-foreground/70">
          {preview ? (
            // Pratinjau lokal (blob:) atau URL foto lama; next/image tidak perlu untuk pratinjau.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            "Belum ada"
          )}
        </span>
        <span className="text-sm">
          <span className="font-medium text-accent-strong">{preview ? "Ganti foto" : "Pilih foto"}</span>
          <span className="block text-xs text-foreground/70">Dari galeri atau kamera HP</span>
        </span>
        <input
          type="file"
          name={name}
          accept="image/*"
          required={required}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setPreview(URL.createObjectURL(file));
          }}
        />
      </label>
      <FieldError message={error} />
    </div>
  );
}
