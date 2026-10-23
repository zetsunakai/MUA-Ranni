import TestimonialMarquee from "@/components/home/TestimonialMarquee";
import type { Testimonial } from "@/types";

export default function ClientQuotes({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials.length) return null;
  return <section className="client-testimonials" aria-label="Kata klien">
    <p className="editorial-label mb-8 text-center">Kata klien</p>
    <TestimonialMarquee testimonials={testimonials} />
  </section>;
}
