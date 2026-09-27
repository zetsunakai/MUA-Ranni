// "Pesta & Party" -> "pesta-party". Dipakai untuk id yang tidak pernah berubah.
export function slugify(text: string): string {
  const slug = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "item";
}

// id unik: tambahkan -2, -3, ... kalau sudah dipakai.
export function uniqueId(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  let id = base;
  for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
  return id;
}
