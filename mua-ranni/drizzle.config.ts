import { defineConfig } from "drizzle-kit";

// Dipakai oleh `npm run db:generate` (buat file migrasi SQL dari schema.ts)
// dan `npm run db:migrate` (jalankan migrasi ke database Supabase).
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
