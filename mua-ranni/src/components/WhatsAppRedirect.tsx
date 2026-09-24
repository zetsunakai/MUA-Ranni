"use client";

import { useEffect } from "react";
import { directWhatsappUrl } from "@/lib/whatsapp";

// Halaman ini hanya "lewat": tunggu script Vercel Analytics mencatat kunjungan,
// lalu pindah ke WhatsApp. Kalau script diblokir (ad blocker), tetap pindah
// setelah batas waktu, jadi pengunjung tidak pernah tertahan.
const MAX_WAIT_MS = 1500;
const AFTER_SCRIPT_MS = 300;

// Pesan diambil dari ?text=... di URL; hanya bisa dibaca di browser.
function targetUrl(): string {
  const text = new URLSearchParams(window.location.search).get("text") ?? undefined;
  return directWhatsappUrl(text);
}

export default function WhatsAppRedirect() {
  useEffect(() => {
    const url = targetUrl();

    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      window.location.replace(url);
    };

    const fallback = window.setTimeout(go, MAX_WAIT_MS);
    const script = document.querySelector<HTMLScriptElement>('script[src*="/_vercel/insights/script.js"], script[src*="va.vercel-scripts.com"]');
    const onLoad = () => window.setTimeout(go, AFTER_SCRIPT_MS);
    if (window.vai) onLoad(); // script sudah jalan
    else script?.addEventListener("load", onLoad);

    return () => {
      window.clearTimeout(fallback);
      script?.removeEventListener("load", onLoad);
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <p className="font-heading text-2xl font-semibold">Membuka WhatsApp…</p>
      <p className="text-foreground/70">Kalau tidak terbuka otomatis, ketuk tombol di bawah.</p>
      <a
        href={directWhatsappUrl()}
        onClick={(e) => {
          e.preventDefault();
          window.location.replace(targetUrl());
        }}
        className="rounded-full bg-accent-strong px-6 py-3 font-medium text-white"
      >
        Buka WhatsApp
      </a>
    </div>
  );
}
