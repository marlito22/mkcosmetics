import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import sharp from "sharp";

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function saveImage(
  file: File,
  slug: string,
  subdir: string
): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Formato de imagen no permitido (usa JPG, PNG o WebP).");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Cada imagen no puede superar 4 MB.");
  }
  const dir = path.join(UPLOADS_ROOT, subdir);
  await fs.mkdir(dir, { recursive: true });
  const fileName = `${slug}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.webp`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await sharp(buffer)
    .rotate()
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(dir, fileName));
  return `${subdir}/${fileName}`;
}

export async function unlinkImage(relativePath: string): Promise<void> {
  await fs.unlink(path.join(UPLOADS_ROOT, relativePath)).catch(() => {});
}
