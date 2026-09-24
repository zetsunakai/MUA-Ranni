import { categoryLabels } from "@/data/site";
import type { Testimonial } from "@/types";

export default function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-xl border border-line bg-surface p-5 sm:p-6">
      <span aria-hidden="true" className="font-heading text-5xl leading-none text-accent">
        “
      </span>
      <blockquote className="mt-1 flex-1 text-foreground/80">{testimonial.quote}</blockquote>
      <figcaption className="mt-4 text-sm">
        <span className="font-semibold">{testimonial.clientName}</span>
        <span className="text-foreground/70"> · {categoryLabels[testimonial.eventType]}</span>
      </figcaption>
    </figure>
  );
}
