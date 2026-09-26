import "server-only";

import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./config";

// Client dengan SECRET key: melewati RLS, jadi HANYA dipakai di server setelah
// requireAdmin(). Tidak pernah diberi awalan NEXT_PUBLIC_ dan tidak pernah dikirim ke browser.
export function createSupabaseAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) return null;
  return createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const PORTFOLIO_BUCKET = "portfolio";
