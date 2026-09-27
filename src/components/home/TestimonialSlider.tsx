"use client";

import Image from "next/image";
import { useState } from "react";
import type { Testimonial } from "@/types";

export default function TestimonialSlider({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const t = testimonials[index];
  const go = (step: number) => setIndex((i) => (i + step + testimonials.length) % testimonials.length);

  return (
    <div className="grid gap-8 md:grid-cols-[200px_1fr] md:gap-16">
      <div className="relative hidden h-[150px] w-[120px] overflow-hidden rounded-t-full rounded-b bg-sand md:block">
        {t.photoUrl && <Image src={t.photoUrl} alt={`Foto dari ${t.clientName}`} fill sizes="120px" className="object-cover" />}
      </div>
      <figure aria-live="polite">
        <blockquote className="font-heading text-[32px] leading-[1.15] italic md:text-5xl">“{t.quote}”</blockquote>
        <figcaption className="mt-6 text-[15px] text-muted">
          {t.clientName} · {t.eventLabel}
        </figcaption>
        {testimonials.length > 1 && (
          <div className="mt-8 flex gap-3">
            <button type="button" onClick={() => go(-1)} aria-label="Testimoni sebelumnya" className="flex h-12 w-12 items-center justify-center rounded-full border border-foreground">
              ←
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Testimoni berikutnya" className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background">
              →
            </button>
          </div>
        )}
      </figure>
    </div>
  );
}
