"use client";

import { useEffect } from "react";
import { directWhatsappUrl } from "@/lib/whatsapp";

// Halaman ini hanya "lewat": tunggu script Vercel Analytics mencatat kunjungan,
// lalu pindah ke WhatsApp. Kalau script diblokir (ad blocker), tetap pindah
// setelah batas waktu, jadi pengunjung tidak pernah tertahan.
const MAX_WAIT_MS = 1500;
const AFTER_SCRIPT_MS = 150; // beri waktu script mengirim kunjungan (fetch keepalive)

// Pesan diambil dari ?text=... di URL; hanya bisa dibaca di browser.
function targetUrl(number: string): string {
  const text = new URLSearchParams(window.location.search).get("text") ?? undefined;
  return directWhatsappUrl(number, text);
}

// number = nomor WA dari profil admin (dikirim oleh halaman /chat/[source]).
export default function WhatsAppRedirect({ number }: { number: string }) {
  useEffect(() => {
    const url = targetUrl(number);

    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      window.location.replace(url);
    };

    // Script analytics Vercel dimuat dari path acak (anti ad blocker), jadi yang
    // ditunggu adalah tanda window.vai yang dipasang script itu saat sudah aktif.
    const fallback = window.setTimeout(go, MAX_WAIT_MS);
    const poll = window.setInterval(() => {
      if (!window.vai) return;
      window.clearInterval(poll);
      window.setTimeout(go, AFTER_SCRIPT_MS);
    }, 50);

    return () => {
      window.clearTimeout(fallback);
      window.clearInterval(poll);
    };
  }, [number]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <p className="font-heading text-2xl font-semibold">Membuka WhatsApp…</p>
      <p className="text-foreground/70">Kalau tidak terbuka otomatis, ketuk tombol di bawah.</p>
      <a
        href={directWhatsappUrl(number)}
        onClick={(e) => {
          e.preventDefault();
          window.location.replace(targetUrl(number));
        }}
        className="rounded-full bg-accent-strong px-6 py-3 font-medium text-white"
      >
        Buka WhatsApp
      </a>
    </div>
  );
}
