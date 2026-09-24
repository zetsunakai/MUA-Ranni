import { testimonials, testimonialsArePlaceholder } from "@/data/testimonials";

// VERCEL_ENV diisi otomatis oleh Vercel saat build: "production" untuk domain utama,
// "preview" untuk deploy dari branch lain. Di laptop nilainya kosong.
const isProduction = process.env.VERCEL_ENV === "production";

export function getPublicTestimonials() {
  if (testimonialsArePlaceholder && isProduction) return [];
  return testimonials;
}
