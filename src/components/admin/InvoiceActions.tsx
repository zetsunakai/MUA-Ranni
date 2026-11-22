"use client";

import { useState } from "react";

// Di HP: "Bagikan" membuka share sheet (pilih WhatsApp, gambar langsung terlampir).
// Browser yang tidak mendukung berbagi file cukup memakai tombol Download.
export default function InvoiceActions({ src, fileName }: { src: string; fileName: string }) {
  const [status, setStatus] = useState("");

  const share = async () => {
    setStatus("Menyiapkan gambar…");
    try {
      const blob = await (await fetch(src)).blob();
      const file = new File([blob], fileName, { type: "image/png" });
      if (!navigator.canShare?.({ files: [file] })) {
        setStatus("Browser ini tidak bisa berbagi gambar. Pakai Download.");
        return;
      }
      await navigator.share({ files: [file] });
      setStatus("");
    } catch (error) {
      // AbortError = pengguna menutup share sheet; bukan kesalahan.
      setStatus(error instanceof DOMException && error.name === "AbortError" ? "" : "Gagal membagikan. Pakai Download.");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={share} className="min-h-11 bg-foreground px-5 text-sm text-white">Bagikan</button>
      <a href={src} download={fileName} className="flex min-h-11 items-center border border-line px-5 text-sm hover:bg-accent-soft">Download PNG</a>
      {status && <p aria-live="polite" className="text-sm text-foreground/70">{status}</p>}
    </div>
  );
}
