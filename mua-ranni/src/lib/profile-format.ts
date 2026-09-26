// Fungsi format profil yang aman dipakai di server maupun browser.

// "0831-3635-9324" / "+62 831 3635 9324" / "6283136359324" -> "6283136359324" (format wa.me).
export function normalizeWhatsapp(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  else if (digits.startsWith("8")) digits = "62" + digits;
  return /^62\d{8,13}$/.test(digits) ? digits : null;
}

// "6283136359324" -> "0831-3635-9324"
export function displayWhatsapp(number: string): string {
  const local = number.startsWith("62") ? "0" + number.slice(2) : number;
  return [local.slice(0, 4), local.slice(4, 8), local.slice(8)].filter(Boolean).join("-");
}

// "@rannitary_makeup" / "https://instagram.com/rannitary_makeup/" -> "rannitary_makeup"
export function normalizeHandle(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const fromUrl = trimmed.match(/(?:instagram\.com|tiktok\.com)\/@?([^/?#]+)/i)?.[1];
  const handle = (fromUrl ?? trimmed).replace(/^@/, "");
  return /^[A-Za-z0-9._]{1,30}$/.test(handle) ? handle : null;
}
