import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

const MIME_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  // Evita path traversal: resuelve y confirma que sigue dentro de uploads/
  const filePath = path.resolve(UPLOADS_ROOT, ...segments);
  if (!filePath.startsWith(path.resolve(UPLOADS_ROOT) + path.sep)) {
    return new NextResponse("No encontrado", { status: 404 });
  }

  const mime = MIME_TYPES[path.extname(filePath).toLowerCase()];
  if (!mime) {
    return new NextResponse("No encontrado", { status: 404 });
  }

  try {
    const file = await fs.readFile(filePath);
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": mime,
        // Cache largo para que Cloudflare sirva las imágenes desde su CDN
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("No encontrado", { status: 404 });
  }
}
