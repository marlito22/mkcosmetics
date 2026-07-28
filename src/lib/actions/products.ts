"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";
import { z } from "zod";
import { db } from "@/db";
import { productImages, products } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/auth";
import { slugify } from "@/lib/slug";

const UPLOADS_DIR = path.join(process.cwd(), "uploads", "products");
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const productSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().max(5000).optional(),
  price: z.coerce.number().int().min(0),
  categoryId: z.coerce.number().int().positive().optional(),
  brandId: z.coerce.number().int().positive().optional(),
  available: z.coerce.boolean(),
  featured: z.coerce.boolean(),
});

export type ProductFormState = { error?: string };

export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    throw new Error("No autorizado");
  }
}

async function uniqueSlug(name: string, excludeId?: number): Promise<string> {
  const base = slugify(name) || "producto";
  let slug = base;
  for (let i = 2; ; i++) {
    const existing = await db.query.products.findFirst({
      where: eq(products.slug, slug),
    });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${i}`;
  }
}

async function saveImage(file: File, slug: string): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Formato de imagen no permitido (usa JPG, PNG o WebP).");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("La imagen no puede superar 8 MB.");
  }
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const fileName = `${slug}-${Date.now()}.webp`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await sharp(buffer)
    .rotate()
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(UPLOADS_DIR, fileName));
  return `products/${fileName}`;
}

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    categoryId: formData.get("categoryId") || undefined,
    brandId: formData.get("brandId") || undefined,
    available: formData.get("available") === "on",
    featured: formData.get("featured") === "on",
  });
}

export async function createProduct(
  _prev: ProductFormState | undefined,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: "Revisa los datos: nombre (mín. 3 letras) y precio son obligatorios." };
  }

  const slug = await uniqueSlug(parsed.data.name);

  let imagePath: string | null = null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    try {
      imagePath = await saveImage(file, slug);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Error al subir la imagen." };
    }
  }

  let product;
  try {
    [product] = await db
      .insert(products)
      .values({
        name: parsed.data.name,
        slug,
        description: parsed.data.description ?? null,
        price: parsed.data.price,
        categoryId: parsed.data.categoryId ?? null,
        brandId: parsed.data.brandId ?? null,
        available: parsed.data.available,
        featured: parsed.data.featured,
      })
      .returning();

    if (imagePath) {
      await db.insert(productImages).values({
        productId: product.id,
        path: imagePath,
        position: 0,
      });
    }
  } catch (err) {
    console.error("Error al crear el producto:", err);
    return {
      error: err instanceof Error ? err.message : "Error al crear el producto.",
    };
  }

  revalidatePath("/");
  redirect("/admin/productos");
}

export async function updateProduct(
  productId: number,
  _prev: ProductFormState | undefined,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const existing = await db.query.products.findFirst({
    where: eq(products.id, productId),
    with: { images: true },
  });
  if (!existing) return { error: "El producto no existe." };

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: "Revisa los datos: nombre (mín. 3 letras) y precio son obligatorios." };
  }

  const slug =
    parsed.data.name === existing.name
      ? existing.slug
      : await uniqueSlug(parsed.data.name, productId);

  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    try {
      const imagePath = await saveImage(file, slug);
      // Reemplaza la imagen principal y elimina el archivo anterior
      const oldImage = existing.images[0];
      if (oldImage) {
        await db.delete(productImages).where(eq(productImages.id, oldImage.id));
        await fs
          .unlink(path.join(process.cwd(), "uploads", oldImage.path))
          .catch(() => {});
      }
      await db.insert(productImages).values({
        productId,
        path: imagePath,
        position: 0,
      });
    } catch (err) {
      console.error(`Error al guardar la imagen del producto ${productId}:`, err);
      return {
        error:
          err instanceof Error ? err.message : "Error al subir la imagen.",
      };
    }
  }

  await db
    .update(products)
    .set({
      name: parsed.data.name,
      slug,
      description: parsed.data.description ?? null,
      price: parsed.data.price,
      categoryId: parsed.data.categoryId ?? null,
      brandId: parsed.data.brandId ?? null,
      available: parsed.data.available,
      featured: parsed.data.featured,
    })
    .where(eq(products.id, productId));

  revalidatePath("/");
  redirect("/admin/productos");
}

export async function deleteProduct(productId: number): Promise<void> {
  await requireAdmin();

  const existing = await db.query.products.findFirst({
    where: eq(products.id, productId),
    with: { images: true },
  });
  if (!existing) return;

  await db.delete(products).where(eq(products.id, productId));
  for (const img of existing.images) {
    await fs
      .unlink(path.join(process.cwd(), "uploads", img.path))
      .catch(() => {});
  }

  revalidatePath("/");
  revalidatePath("/admin/productos");
}

