"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import type { FormState } from "@/app/admin/actions";
import { addPayment } from "@/app/admin/booking/actions";
import { DEFAULT_DP, PAYMENT_KIND_LABELS, PAYMENT_METHOD_LABELS, type PaymentKind, type PaymentMethod } from "@/lib/booking-math";

const initialState: FormState = { status: "idle", message: "" };
const inputClass = "mt-1 min-h-11 w-full rounded-none border border-line bg-background px-3 text-base text-foreground outline-none focus:border-accent-strong";

type Props = { bookingId: string; today: string; balance: number; hasPayments: boolean };

export default function PaymentForm({ bookingId, today, balance, hasPayments }: Props) {
  const [state, formAction, saving] = useActionState(addPayment, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  const onSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const formData = new FormData(ev.currentTarget);
    startTransition(() => formAction(formData));
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="bookingId" value={bookingId} />
      <label className="text-sm font-medium">
        Tanggal bayar
        <input name="paidOn" type="date" required defaultValue={today} className={inputClass} />
      </label>
      <label className="text-sm font-medium">
        Nominal
        <AmountInput key={`${balance}-${hasPayments}`} initial={hasPayments ? Math.max(0, balance) : Math.min(DEFAULT_DP, Math.max(0, balance))} />
      </label>
      <label className="text-sm font-medium">
        Jenis
        <select name="kind" defaultValue={hasPayments ? "pelunasan" : "dp"} key={String(hasPayments)} className={inputClass}>
          {(Object.keys(PAYMENT_KIND_LABELS) as PaymentKind[]).map((k) => <option key={k} value={k}>{PAYMENT_KIND_LABELS[k]}</option>)}
        </select>
      </label>
      <label className="text-sm font-medium">
        Metode
        <select name="method" defaultValue="bca" className={inputClass}>
          {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((m) => <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>)}
        </select>
      </label>
      <label className="text-sm font-medium sm:col-span-2">
        Catatan <span className="font-normal text-foreground/60">(opsional)</span>
        <input name="note" maxLength={200} className={inputClass} />
      </label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={saving} className="h-11 rounded-none bg-foreground px-6 font-medium text-white disabled:opacity-60">
          {saving ? "Menyimpan…" : "Catat pembayaran"}
        </button>
        <p aria-live="polite" className={`text-sm ${state.status === "error" ? "text-red-700" : "text-foreground/80"}`}>{state.message}</p>
      </div>
    </form>
  );
}

// Nominal dengan titik ribuan (50.000). Yang dikirim ke server tetap angka polos.
function AmountInput({ initial }: { initial: number }) {
  const [amount, setAmount] = useState(initial);
  return (
    <div className="mt-1 flex min-h-11 items-center border border-line bg-background focus-within:border-accent-strong">
      <span className="pl-3 text-foreground/50">Rp</span>
      <input
        type="text"
        inputMode="numeric"
        required
        value={amount ? amount.toLocaleString("id-ID") : ""}
        placeholder="0"
        onChange={(ev) => setAmount(Math.min(1_000_000_000, Number(ev.target.value.replace(/\D/g, "")) || 0))}
        className="h-11 min-w-0 flex-1 bg-transparent px-2 text-base text-foreground tabular-nums outline-none"
      />
      <input type="hidden" name="amount" value={amount} />
    </div>
  );
}
