import Image from "next/image";
import type { Testimonial } from "@/types";

export default function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface">
      {testimonial.photoUrl && (
        <div className="relative aspect-[4/3] bg-accent-soft">
          <Image
            src={testimonial.photoUrl}
            alt={`Hasil makeup ${testimonial.clientName}`}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <span aria-hidden="true" className="font-heading text-6xl leading-none text-accent">
          “
        </span>
        <blockquote className="mt-1 flex-1 text-foreground/80">{testimonial.quote}</blockquote>
        <figcaption className="mt-4 text-sm">
          <span className="font-semibold">{testimonial.clientName}</span>
          <span className="text-foreground/70"> · {testimonial.eventLabel}</span>
        </figcaption>
      </div>
    </figure>
  );
}
