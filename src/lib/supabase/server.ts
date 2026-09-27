import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseKey, supabaseUrl } from "./config";

// Client Supabase untuk Server Component dan Server Action.
// Sesi login disimpan di cookie, jadi client dibuat ulang per request.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component tidak boleh menulis cookie. Aman diabaikan karena
          // proxy.ts sudah memperbarui sesi sebelum halaman di-render.
        }
      },
    },
  });
}
