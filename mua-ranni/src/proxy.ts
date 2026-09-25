import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseKey, supabaseUrl } from "@/lib/supabase/config";

// Proxy (dulu "middleware") berjalan sebelum halaman /admin/* di-render:
// 1. Memperbarui token login yang hampir kedaluwarsa dan menyimpannya ke cookie.
// 2. Cek cepat: belum login -> ke /admin/login; sudah login -> jangan tampilkan form login lagi.
// Pemeriksaan hak admin yang sesungguhnya tetap di requireAdmin() (src/lib/auth.ts).
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!supabaseUrl || !supabaseKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const loggedIn = Boolean(data?.claims);
  const onLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!loggedIn && !onLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (loggedIn && onLoginPage) {
    return NextResponse.redirect(new URL("/admin/harga", request.url));
  }
  return response;
}

// Hanya halaman admin. Halaman publik tidak melewati proxy, jadi tetap statis dan cepat.
export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
