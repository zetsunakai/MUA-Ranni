"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

// Tombol submit dengan konfirmasi (window.confirm) dan status "sedang diproses".
type Props = ComponentProps<"button"> & { confirmMessage?: string; pendingLabel?: string };

export default function ConfirmButton({ confirmMessage, pendingLabel, children, onClick, ...rest }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (confirmMessage && !window.confirm(confirmMessage)) e.preventDefault();
        onClick?.(e);
      }}
      {...rest}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
