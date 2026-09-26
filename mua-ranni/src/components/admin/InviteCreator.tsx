"use client";

import { useActionState, useState } from "react";
import { createInvite, type InviteState } from "@/app/admin/testimoni/actions";
import { categories, categoryLabels, site } from "@/data/site";

const initialState: InviteState = { status: "idle", message: "" };

export default function InviteCreator() {
  const [state, formAction, pending] = useActionState(createInvite, initialState);
  const [copied, setCopied] = useState(false);

  const waMessage = state.link
    ? `Halo Kak ${state.clientName}! Terima kasih sudah makeup bareng ${site.name} 💕\n\nBoleh minta tolong isi testimoni singkat di link ini ya (cuma 1 menit):\n${state.link}`
    : "";

  return (
    <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <h2 className="font-heading text-xl font-semibold">Minta testimoni</h2>
      <p className="mt-0.5 text-xs text-foreground/70">Buat link khusus untuk satu klien, lalu kirim lewat WhatsApp.</p>

      <form action={formAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_11rem_auto] sm:items-end">
        <div>
          <label htmlFor="invite-name" className="text-xs text-foreground/70">
            Nama klien
          </label>
          <input
            id="invite-name"
            name="clientName"
            required
            maxLength={60}
            placeholder="contoh: Nadia"
            className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2.5 text-base outline-none focus:border-accent-strong"
          />
        </div>
        <div>
          <label htmlFor="invite-event" className="text-xs text-foreground/70">
            Acara (opsional)
          </label>
          <select
            id="invite-event"
            name="eventType"
            defaultValue=""
            className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2.5 text-base outline-none focus:border-accent-strong"
          >
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {categoryLabels[c]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent-strong px-5 py-2.5 font-medium text-white hover:bg-foreground disabled:opacity-60"
        >
          {pending ? "Membuat…" : "Buat link"}
        </button>
      </form>

      {state.status === "error" && <p className="mt-3 text-sm text-red-700">{state.message}</p>}

      {state.link && (
        <div role="status" className="mt-4 rounded-lg bg-accent-soft p-3">
          <p className="text-sm">{state.message}</p>
          <p className="mt-2 break-all rounded bg-surface px-2 py-1.5 font-mono text-xs">{state.link}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(waMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-accent-strong px-4 py-2 text-sm font-medium text-white"
            >
              Kirim via WhatsApp
            </a>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(state.link!);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="rounded-full border border-line bg-surface px-4 py-2 text-sm"
            >
              {copied ? "Tersalin ✓" : "Salin link"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
