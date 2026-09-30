// Link lokasi dari menu Bagikan Google Maps, termasuk format pendek di HP.
export function isGoogleMapsUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password || url.port) return false;

    if (url.hostname === "maps.app.goo.gl") return url.pathname.length > 1;
    if (url.hostname === "goo.gl") return url.pathname.startsWith("/maps/") && url.pathname.length > 6;
    if (url.hostname === "maps.google.com" || url.hostname === "maps.google.co.id") return true;
    if (["google.com", "www.google.com", "google.co.id", "www.google.co.id"].includes(url.hostname)) {
      return url.pathname === "/maps" || url.pathname.startsWith("/maps/");
    }
    return false;
  } catch {
    return false;
  }
}
