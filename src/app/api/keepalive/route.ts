import { sql } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { getDb } from "@/db";
import { supabaseKey, supabaseUrl } from "@/lib/supabase/config";

// Dipanggil Vercel Cron sekali sehari (lihat vercel.json). Project Supabase paket Free
// di-pause kalau database sepi 7 hari; halaman publik situs ini statis sehingga jarang
// menyentuh database. Endpoint ini membuat sedikit aktivitas harian supaya tetap aktif.
//
// Diamankan dengan CRON_SECRET: Vercel otomatis mengirim "Authorization: Bearer <CRON_SECRET>".
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const started = Date.now();
  const db = getDb();
  if (!db) return Response.json({ ok: false, error: "DATABASE_URL kosong" }, { status: 500 });

  // 1) Query langsung ke database lewat pooler.
  const { rows } = await db.execute(sql`select count(*)::int as categories from categories`);

  // 2) Permintaan ke Data API Supabase (RLS membuat hasilnya kosong, tapi tetap tercatat aktivitas).
  let restStatus: number | null = null;
  if (supabaseUrl && supabaseKey) {
    const res = await fetch(`${supabaseUrl}/rest/v1/categories?select=id&limit=1`, {
      headers: { apikey: supabaseKey },
      cache: "no-store",
    });
    restStatus = res.status;
  }

  return Response.json({ ok: true, categories: rows[0]?.categories, restStatus, ms: Date.now() - started });
}
