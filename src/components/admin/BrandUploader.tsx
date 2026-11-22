"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import type { FormState } from "@/app/admin/actions";
import { addBrand } from "@/app/admin/brand/actions";
import { compressImage } from "@/lib/compress-image";

const initialState: FormState = { status: "idle", message: "" };

// Logo dikecilkan di browser, lalu ukurannya (lebar × tinggi) ikut dikirim
// supaya tampilan logo di website bisa diseimbangkan.
export default function BrandUploader() {
  const [state, formAction, saving] = useActionState(addBrand, initialState);
  const [preparing, setPreparing] = useState(false);
  const [clientError, setClientError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const formData = new FormData(ev.currentTarget);
    const file = formData.get("logo");
    setClientError("");
    if (!(file instanceof File) || file.size === 0) return setClientError("Pilih file logo.");
    setPreparing(true);
    try {
      const small = await compressImage(file);
      const bitmap = await createImageBitmap(small);
      formData.set("logo", small);
      formData.set("width", String(bitmap.width));
      formData.set("height", String(bitmap.height));
      bitmap.close();
    } catch {
      setPreparing(false);
      return setClientError("Logo tidak bisa diproses. Coba file lain (PNG/JPG/WebP).");
    }
    setPreparing(false);
    startTransition(() => formAction(formData));
  };

  const busy = saving || preparing;
  const message = preparing ? "Menyiapkan logo…" : saving ? "Mengunggah…" : clientError || state.message;
  const isError = Boolean(clientError) || state.status === "error";

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-3 border border-dashed border-line bg-surface p-4 sm:p-5">
      <h2 className="font-heading text-2xl">Tambah brand</h2>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="text-sm font-medium">
          Nama brand
          <input name="name" required maxLength={40} className="mt-1 min-h-11 w-full border border-line bg-background px-3 text-base outline-none focus:border-accent-strong" />
        </label>
        <label className="text-sm font-medium">
          File logo <span className="font-normal text-foreground/60">(PNG transparan paling bagus)</span>
          <input name="logo" type="file" required accept="image/png,image/jpeg,image/webp" className="mt-1 block w-full text-sm file:mr-3 file:min-h-11 file:border file:border-line file:bg-background file:px-4 file:text-sm" />
        </label>
        <button type="submit" disabled={busy} className="h-11 bg-foreground px-5 text-sm font-medium text-white disabled:opacity-60">+ Tambah</button>
      </div>
      {message && <p aria-live="polite" className={`text-sm ${isError ? "text-red-700" : "text-foreground/80"}`}>{message}</p>}
    </form>
  );
}
