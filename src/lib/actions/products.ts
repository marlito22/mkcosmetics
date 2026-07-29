"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { productImages, productVariants, products } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { saveImage as saveImageToDisk, unlinkImage } from "@/lib/images";

const MAX_GENERAL_IMAGES = 6;
const MAX_VARIANTS = 10;

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
    redirect("/admin/login");
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
  return saveImageToDisk(file, slug, "products");
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

function collectNewGeneralImages(formData: FormData): File[] {
  return formData
    .getAll("newImages")
    .filter((f): f is File => f instanceof File && f.size > 0);
}

type VariantRow = {
  id: number | null;
  name: string;
  image: File | null;
};

function collectVariantRows(formData: FormData): VariantRow[] {
  const ids = formData.getAll("variantId");
  const names = formData.getAll("variantName");
  const images = formData.getAll("variantImage");

  const rows: VariantRow[] = [];
  for (let i = 0; i < names.length; i++) {
    const rawName = names[i];
    const name = typeof rawName === "string" ? rawName.trim() : "";
    const rawId = ids[i];
    const id =
      typeof rawId === "string" && rawId.trim() !== ""
        ? Number(rawId)
        : null;
    const rawImage = images[i];
    const image =
      rawImage instanceof File && rawImage.size > 0 ? rawImage : null;

    if (!name && !image && id === null) continue; // fila vacía sin usar
    rows.push({ id, name, image });
  }
  return rows;
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

  const generalFiles = collectNewGeneralImages(formData);
  if (generalFiles.length > MAX_GENERAL_IMAGES) {
    return { error: `Puedes subir hasta ${MAX_GENERAL_IMAGES} imágenes generales.` };
  }

  const variantRows = collectVariantRows(formData);
  if (variantRows.length > MAX_VARIANTS) {
    return { error: `Puedes agregar hasta ${MAX_VARIANTS} tonos.` };
  }
  if (variantRows.some((row) => !row.name)) {
    return { error: "Cada tono necesita un nombre." };
  }
  if (variantRows.some((row) => !row.image)) {
    return { error: "Cada tono necesita su propia imagen." };
  }

  const slug = await uniqueSlug(parsed.data.name);

  let generalPaths: string[] = [];
  let variantData: { name: string; path: string }[] = [];
  try {
    generalPaths = await Promise.all(
      generalFiles.map((file) => saveImage(file, slug))
    );
    variantData = await Promise.all(
      variantRows.map(async (row) => ({
        name: row.name,
        path: await saveImage(row.image as File, `${slug}-tono`),
      }))
    );
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al subir las imágenes." };
  }

  try {
    await db.transaction(async (tx) => {
      const [product] = await tx
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

      if (generalPaths.length > 0) {
        await tx.insert(productImages).values(
          generalPaths.map((imgPath, i) => ({
            productId: product.id,
            path: imgPath,
            position: i,
          }))
        );
      }

      if (variantData.length > 0) {
        await tx.insert(productVariants).values(
          variantData.map((v, i) => ({
            productId: product.id,
            name: v.name,
            imagePath: v.path,
            position: i,
          }))
        );
      }
    });
  } catch (err) {
    console.error("Error al crear el producto:", err);
    // Las imágenes ya se guardaron en disco; limpiar para no dejar huérfanas
    await Promise.all(
      [...generalPaths, ...variantData.map((v) => v.path)].map(unlinkImage)
    );
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

  let existing;
  try {
    existing = await db.query.products.findFirst({
      where: eq(products.id, productId),
      with: { images: true, variants: true },
    });
  } catch (err) {
    console.error(`Error al buscar el producto ${productId}:`, err);
    return {
      error: err instanceof Error ? err.message : "Error al buscar el producto.",
    };
  }
  if (!existing) return { error: "El producto no existe." };

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: "Revisa los datos: nombre (mín. 3 letras) y precio son obligatorios." };
  }

  const slug =
    parsed.data.name === existing.name
      ? existing.slug
      : await uniqueSlug(parsed.data.name, productId);

  // --- Imágenes generales ---
  const removeImageIds = formData
    .getAll("removeImage")
    .map((v) => Number(v))
    .filter((id) => existing!.images.some((img) => img.id === id));
  const newGeneralFiles = collectNewGeneralImages(formData);
  const remainingGeneralCount =
    existing.images.length - removeImageIds.length + newGeneralFiles.length;
  if (remainingGeneralCount > MAX_GENERAL_IMAGES) {
    return { error: `Puedes tener hasta ${MAX_GENERAL_IMAGES} imágenes generales.` };
  }

  // --- Tonos ---
  const removeVariantIds = formData
    .getAll("removeVariant")
    .map((v) => Number(v))
    .filter((id) => existing!.variants.some((v) => v.id === id));
  const variantRows = collectVariantRows(formData);
  if (variantRows.length > MAX_VARIANTS) {
    return { error: `Puedes tener hasta ${MAX_VARIANTS} tonos.` };
  }
  if (variantRows.some((row) => !row.name)) {
    return { error: "Cada tono necesita un nombre." };
  }
  const newVariantRowsMissingImage = variantRows.some(
    (row) => row.id === null && !row.image
  );
  if (newVariantRowsMissingImage) {
    return { error: "Cada tono nuevo necesita su propia imagen." };
  }

  let newGeneralPaths: string[] = [];
  const variantSaves: { row: VariantRow; path: string | null }[] = [];
  try {
    newGeneralPaths = await Promise.all(
      newGeneralFiles.map((file) => saveImage(file, slug))
    );
    for (const row of variantRows) {
      if (row.image) {
        const savedPath = await saveImage(row.image, `${slug}-tono`);
        variantSaves.push({ row, path: savedPath });
      } else {
        variantSaves.push({ row, path: null });
      }
    }
  } catch (err) {
    await Promise.all(newGeneralPaths.map(unlinkImage));
    await Promise.all(
      variantSaves.filter((v) => v.path).map((v) => unlinkImage(v.path as string))
    );
    return { error: err instanceof Error ? err.message : "Error al subir las imágenes." };
  }

  try {
    await db.transaction(async (tx) => {
      for (const imgId of removeImageIds) {
        await tx.delete(productImages).where(eq(productImages.id, imgId));
      }
      if (newGeneralPaths.length > 0) {
        const basePosition =
          existing!.images.filter((img) => !removeImageIds.includes(img.id))
            .length;
        await tx.insert(productImages).values(
          newGeneralPaths.map((imgPath, i) => ({
            productId,
            path: imgPath,
            position: basePosition + i,
          }))
        );
      }

      for (const imgId of removeVariantIds) {
        await tx.delete(productVariants).where(eq(productVariants.id, imgId));
      }

      let variantPosition =
        existing!.variants.filter((v) => !removeVariantIds.includes(v.id))
          .length;
      for (const { row, path: savedPath } of variantSaves) {
        if (row.id !== null) {
          // Tono existente: actualizar nombre y, si se subió nueva imagen, reemplazarla
          const current = existing!.variants.find((v) => v.id === row.id);
          if (savedPath && current) {
            await unlinkImage(current.imagePath);
            await tx
              .update(productVariants)
              .set({ name: row.name, imagePath: savedPath })
              .where(eq(productVariants.id, row.id));
          } else {
            await tx
              .update(productVariants)
              .set({ name: row.name })
              .where(eq(productVariants.id, row.id));
          }
        } else if (savedPath) {
          await tx.insert(productVariants).values({
            productId,
            name: row.name,
            imagePath: savedPath,
            position: variantPosition++,
          });
        }
      }
    });

    // Eliminar del disco los archivos de las imágenes/tonos removidos
    for (const imgId of removeImageIds) {
      const img = existing.images.find((i) => i.id === imgId);
      if (img) await unlinkImage(img.path);
    }
    for (const varId of removeVariantIds) {
      const v = existing.variants.find((i) => i.id === varId);
      if (v) await unlinkImage(v.imagePath);
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
  } catch (err) {
    console.error(`Error al actualizar el producto ${productId}:`, err);
    return {
      error: err instanceof Error ? err.message : "Error al actualizar el producto.",
    };
  }

  revalidatePath("/");
  redirect("/admin/productos");
}

export async function deleteProduct(productId: number): Promise<void> {
  await requireAdmin();

  try {
    const existing = await db.query.products.findFirst({
      where: eq(products.id, productId),
      with: { images: true, variants: true },
    });
    if (!existing) return;

    await db.delete(products).where(eq(products.id, productId));
    for (const img of existing.images) {
      await unlinkImage(img.path);
    }
    for (const v of existing.variants) {
      await unlinkImage(v.imagePath);
    }
  } catch (err) {
    console.error(`Error al eliminar el producto ${productId}:`, err);
    throw err;
  }

  revalidatePath("/");
  revalidatePath("/admin/productos");
}
