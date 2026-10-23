"use client";

import { useFormStatus } from "react-dom";
import { deletePortfolioItem } from "@/app/admin/portofolio/actions";

export default function DeletePortfolioButton({ id, title }: { id: string; title: string }) {
  return (
    <form
      action={deletePortfolioItem}
      onSubmit={(e) => {
        if (!window.confirm(`Hapus "${title}"? Foto akan hilang dari website dan tidak bisa dikembalikan.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-none border border-red-300 px-4 py-2 text-sm text-red-700 disabled:opacity-60">
      {pending ? "Menghapus…" : "Hapus foto ini"}
    </button>
  );
}
