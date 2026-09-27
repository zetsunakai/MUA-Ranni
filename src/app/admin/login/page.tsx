import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";
import { site } from "@/data/site";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">Admin</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold">{site.name}</h1>
      <p className="mt-2 text-sm text-foreground/70">Masuk untuk mengubah harga di website.</p>

      <div className="mt-8">
        {isSupabaseConfigured() ? (
          <LoginForm />
        ) : (
          <p className="rounded-lg border border-line bg-surface p-4 text-sm">
            Supabase belum disambungkan. Isi <code>NEXT_PUBLIC_SUPABASE_URL</code> dan{" "}
            <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> di environment variables.
          </p>
        )}
      </div>
    </div>
  );
}
