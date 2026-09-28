"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Testimonial } from "@/types";

// Minimal kartu dalam satu putaran, supaya jalurnya selalu lebih lebar dari layar
// walau testimoninya baru sedikit (kartu 280–360px × 6 > 1440px).
const MIN_CARDS_PER_LOOP = 6;
// Kecepatan jalan otomatis (px per detik): cukup pelan supaya kutipan sempat dibaca.
const SPEED = 30;
// Jeda sebelum jalan otomatis lagi setelah kartu digeser manual.
const RESUME_DELAY_MS = 2000;
// Seberapa cepat luncuran (momentum) setelah swipe melambat: makin besar makin cepat berhenti.
const FRICTION = 4;

function Card({ testimonial: t }: { testimonial: Testimonial }) {
  return (
    <figure className="flex w-[280px] shrink-0 flex-col self-start rounded-xl border border-line bg-surface p-6 md:w-[360px] md:p-8">
      {t.photoUrl && (
        <div className="relative mb-5 h-[75px] w-[60px] overflow-hidden rounded-t-full rounded-b bg-sand">
          <Image
            src={t.photoUrl}
            alt={`Foto dari ${t.clientName}`}
            fill
            sizes="60px"
            draggable={false}
            // Langsung dimuat (bukan lazy): kartu cepat berganti saat digeser, dan fotonya kecil.
            loading="eager"
            className="object-cover"
          />
        </div>
      )}
      <blockquote className="font-heading text-xl leading-snug italic md:text-2xl">“{t.quote}”</blockquote>
      <figcaption className="mt-5 text-sm text-muted">
        {t.clientName} · {t.eventLabel}
      </figcaption>
    </figure>
  );
}

// Kartu testimoni yang terus bergeser dari kiri ke kanan, dan bisa digeser manual tanpa ujung.
// Isi jalur ditulis dua kali; posisi `x` bebas bertambah/berkurang, lalu yang ditampilkan
// adalah x modulo lebar satu putaran. Karena kedua salinan identik, lompatan saat
// modulo berputar tidak terlihat, sehingga jalurnya terasa tak berujung ke dua arah.
export default function TestimonialMarquee({ testimonials }: { testimonials: Testimonial[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const repeat = Math.ceil(MIN_CARDS_PER_LOOP / testimonials.length);
  const loop = Array.from({ length: repeat }, () => testimonials).flat();

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    // Hormati pengaturan "Kurangi gerakan": tidak jalan sendiri, tapi tetap bisa digeser.
    const autoplay = !matchMedia("(prefers-reduced-motion: reduce)").matches;

    let x = 0; // posisi total dalam px, positif = bergeser ke kanan
    let velocity = 0; // px per detik, untuk luncuran setelah swipe
    let dragging = false;
    let lastPointerX = 0;
    let lastPointerTime = 0;
    let hovering = false;
    let visible = false;
    let lastInteraction = 0;
    let lastTime = 0;
    let shown = NaN;
    let frame = 0;

    const render = () => {
      const loopWidth = track.scrollWidth / 2;
      if (!loopWidth) return;
      // Hasilnya selalu di rentang (-loopWidth, 0]: salinan pertama digeser ke kiri
      // sejauh itu, sisanya diisi salinan kedua.
      const offset = (((x % loopWidth) + loopWidth) % loopWidth) - loopWidth;
      if (offset !== shown) {
        track.style.transform = `translateX(${offset}px)`;
        shown = offset;
      }
    };

    const tick = (time: number) => {
      frame = requestAnimationFrame(tick);
      // Batasi selisih waktu supaya tidak melompat jauh setelah tab lama tidak aktif.
      const dt = Math.min(time - (lastTime || time), 50) / 1000;
      lastTime = time;
      if (dragging) return;
      if (Math.abs(velocity) > 5) {
        x += velocity * dt;
        velocity *= Math.exp(-FRICTION * dt);
        lastInteraction = time;
      } else if (autoplay && visible && !hovering && time - lastInteraction > RESUME_DELAY_MS) {
        x += SPEED * dt;
      }
      render();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!e.isPrimary || e.button !== 0) return;
      dragging = true;
      velocity = 0;
      lastPointerX = e.clientX;
      lastPointerTime = e.timeStamp;
      viewport.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastPointerX;
      const dtMs = e.timeStamp - lastPointerTime;
      x += dx;
      // Kecepatan jari (dihaluskan) untuk luncuran setelah dilepas.
      if (dtMs > 0) velocity = 0.8 * ((dx / dtMs) * 1000) + 0.2 * velocity;
      lastPointerX = e.clientX;
      lastPointerTime = e.timeStamp;
      render();
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      // Jari sempat berhenti sebelum dilepas: tidak ada luncuran.
      if (e.timeStamp - lastPointerTime > 100) velocity = 0;
      lastInteraction = performance.now();
    };
    // Browser mengambil alih gerakan (mis. ternyata scroll vertikal): jangan ikut meluncur.
    const onPointerCancel = (e: PointerEvent) => {
      onPointerUp(e);
      velocity = 0;
    };
    // Geser horizontal lewat trackpad/mouse wheel di laptop.
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      x -= e.deltaX;
      velocity = 0;
      lastInteraction = performance.now();
      render();
    };
    const onEnter = (e: PointerEvent) => e.pointerType === "mouse" && (hovering = true);
    const onLeave = (e: PointerEvent) => e.pointerType === "mouse" && (hovering = false);

    // Hanya jalan otomatis saat bagian testimoni terlihat, supaya hemat baterai.
    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    observer.observe(viewport);
    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointercancel", onPointerCancel);
    viewport.addEventListener("wheel", onWheel, { passive: false });
    viewport.addEventListener("pointerenter", onEnter);
    viewport.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", onPointerUp);
      viewport.removeEventListener("pointercancel", onPointerCancel);
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("pointerenter", onEnter);
      viewport.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    // touch-pan-y: geser atas-bawah tetap scroll halaman, geser kiri-kanan ditangani di atas.
    // Sengaja tanpa mask-image dan will-change: di Safari iOS kombinasi itu pada jalur selebar
    // ini membuat kartu tergambar mengecil/berdempetan dan foto hilang.
    <div
      ref={viewportRef}
      className="relative cursor-grab touch-pan-y overflow-hidden select-none active:cursor-grabbing"
    >
      <div ref={trackRef} className="flex w-max">
        {[0, 1].map((copy) => (
          // Salinan kedua hanya untuk visual, jadi disembunyikan dari pembaca layar.
          <ul key={copy} aria-hidden={copy === 1 || undefined} className="flex gap-4 pr-4 md:gap-6 md:pr-6">
            {loop.map((t, i) => (
              // Kartu ulangan (kalau testimoninya sedikit) juga disembunyikan dari pembaca layar.
              <li key={`${t.id}-${i}`} aria-hidden={i >= testimonials.length || undefined} className="flex">
                <Card testimonial={t} />
              </li>
            ))}
          </ul>
        ))}
      </div>
      {/* Efek pudar di tepi kiri dan kanan. */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-[10%] bg-linear-to-r from-background" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-[10%] bg-linear-to-l from-background" />
    </div>
  );
}
