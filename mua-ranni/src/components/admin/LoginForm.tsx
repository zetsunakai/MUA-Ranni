"use client";

import { useActionState } from "react";
import { login, type FormState } from "@/app/admin/actions";

const initialState: FormState = { status: "idle", message: "" };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email}
          required
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-3 text-base outline-none focus:border-accent-strong"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-3 text-base outline-none focus:border-accent-strong"
        />
      </div>

      <p aria-live="polite" className="min-h-5 text-sm text-red-700">
        {state.status === "error" && state.message}
      </p>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent-strong py-3 font-medium text-white transition-colors hover:bg-foreground disabled:opacity-60"
      >
        {pending ? "Masuk…" : "Masuk"}
      </button>
    </form>
  );
}
