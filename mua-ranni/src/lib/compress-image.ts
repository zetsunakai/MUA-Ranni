// Dipakai di browser (Client Component) sebelum upload.
// Foto HP biasanya 3-12 MB; Vercel menolak request > 4,5 MB, dan PRD minta foto ringan.
// Hasil: sisi terpanjang maks 1600 px, WebP (atau JPEG kalau browser tidak bisa WebP),
// kualitas diturunkan bertahap sampai < 400 KB.

const MAX_SIDE = 1600;
const TARGET_BYTES = 400 * 1024;

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function compressImage(file: File): Promise<File> {
  // imageOrientation: foto HP yang diputar (EXIF) tetap tegak.
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let blob: Blob | null = null;
  for (const quality of [0.85, 0.75, 0.65, 0.55]) {
    blob = await toBlob(canvas, "image/webp", quality);
    // Browser lama (Safari < 17) tidak bisa membuat WebP dan diam-diam memberi PNG.
    if (blob && blob.type !== "image/webp") blob = await toBlob(canvas, "image/jpeg", quality);
    if (blob && blob.size <= TARGET_BYTES) break;
  }
  if (!blob) throw new Error("Foto tidak bisa diproses.");

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const name = file.name.replace(/\.[^.]+$/, "") + "." + ext;
  return new File([blob], name, { type: blob.type });
}
