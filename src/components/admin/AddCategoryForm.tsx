"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/admin/actions";
import { addCategory } from "@/app/admin/portofolio/kategori/actions";

const initialState: FormState = { status: "idle", message: "" };

export default function AddCategoryForm() {
  const [state, formAction, pending] = useActionState(addCategory, initialState);
  return (
    <form action={formAction} className="rounded-none border border-line bg-surface p-4">
      <label htmlFor="new-category" className="text-sm font-medium">
        Tambah kategori
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="new-category"
          name="label"
          required
          minLength={2}
          maxLength={30}
          placeholder="contoh: Pesta, Siraman, Henna"
          className="min-w-0 flex-1 rounded-none border border-line bg-background px-3 py-2.5 text-base outline-none focus:border-accent-strong"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-none bg-foreground px-5 py-2.5 font-medium text-white hover:bg-foreground disabled:opacity-60"
        >
          {pending ? "…" : "Tambah"}
        </button>
      </div>
      <p aria-live="polite" className={`mt-2 min-h-5 text-sm ${state.status === "error" ? "text-red-700" : "text-foreground/80"}`}>
        {state.message}
      </p>
    </form>
  );
}
