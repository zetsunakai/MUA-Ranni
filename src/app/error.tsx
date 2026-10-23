"use client";

import Link from "next/link";

// Next 16.3 uses retry() to re-fetch the failed segment (reset is deprecated).
export default function PageError({ retry }: { retry: () => void }) {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col justify-center px-6 py-16">
      <p className="editorial-label">Ranni Tary Makeup</p>
      <h1 className="mt-5 font-heading text-4xl leading-tight">Data sementara belum bisa dimuat.</h1>
      <p className="mt-5 text-sm leading-relaxed text-muted">
        Silakan coba lagi beberapa saat. Data dan perubahan yang sudah tersimpan tetap aman.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()} className="editorial-button editorial-button-primary">Coba lagi</button>
        <Link href="/" className="editorial-button editorial-button-outline">Kembali ke beranda</Link>
      </div>
    </main>
  );
}
