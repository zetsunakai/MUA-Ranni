// Nilai ini dari Supabase: Project Settings → API / Connect.
// Awalan NEXT_PUBLIC_ berarti nilainya ikut terkirim ke browser. Itu aman untuk
// URL dan publishable key; rahasia (DATABASE_URL) TIDAK boleh diberi awalan ini.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey);
}
