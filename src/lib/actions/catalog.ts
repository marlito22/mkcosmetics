"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { brands, categories } from "@/db/schema";
import { requireAdmin } from "@/lib/actions/products";
import { slugify } from "@/lib/slug";

export type CatalogFormState = { error?: string };

const nameSchema = z.string().min(2).max(120);

async function uniqueCategorySlug(name: string, excludeId?: number): Promise<string> {
  const base = slugify(name) || "categoria";
  let slug = base;
  for (let i = 2; ; i++) {
    const existing = await db.query.categories.findFirst({
      where: eq(categories.slug, slug),
    });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${i}`;
  }
}

async function uniqueBrandSlug(name: string, excludeId?: number): Promise<string> {
  const base = slugify(name) || "marca";
  let slug = base;
  for (let i = 2; ; i++) {
    const existing = await db.query.brands.findFirst({
      where: eq(brands.slug, slug),
    });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${i}`;
  }
}

export async function createCategory(
  _prev: CatalogFormState | undefined,
  formData: FormData
): Promise<CatalogFormState> {
  await requireAdmin();
  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!parsed.success) {
    return { error: "El nombre debe tener entre 2 y 120 caracteres." };
  }
  const slug = await uniqueCategorySlug(parsed.data);
  await db.insert(categories).values({ name: parsed.data, slug });

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  revalidatePath("/");
  redirect("/admin/categorias");
}

export async function updateCategory(
  categoryId: number,
  _prev: CatalogFormState | undefined,
  formData: FormData
): Promise<CatalogFormState> {
  await requireAdmin();
  const existing = await db.query.categories.findFirst({
    where: eq(categories.id, categoryId),
  });
  if (!existing) return { error: "La categoría no existe." };

  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!parsed.success) {
    return { error: "El nombre debe tener entre 2 y 120 caracteres." };
  }

  const slug =
    parsed.data === existing.name
      ? existing.slug
      : await uniqueCategorySlug(parsed.data, categoryId);

  await db
    .update(categories)
    .set({ name: parsed.data, slug })
    .where(eq(categories.id, categoryId));

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  revalidatePath("/");
  redirect("/admin/categorias");
}

export async function deleteCategory(categoryId: number): Promise<void> {
  await requireAdmin();
  await db.delete(categories).where(eq(categories.id, categoryId));

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  revalidatePath("/");
}

export async function createBrand(
  _prev: CatalogFormState | undefined,
  formData: FormData
): Promise<CatalogFormState> {
  await requireAdmin();
  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!parsed.success) {
    return { error: "El nombre debe tener entre 2 y 120 caracteres." };
  }
  const slug = await uniqueBrandSlug(parsed.data);
  await db.insert(brands).values({ name: parsed.data, slug });

  revalidatePath("/admin/marcas");
  revalidatePath("/admin/productos");
  revalidatePath("/");
  redirect("/admin/marcas");
}

export async function updateBrand(
  brandId: number,
  _prev: CatalogFormState | undefined,
  formData: FormData
): Promise<CatalogFormState> {
  await requireAdmin();
  const existing = await db.query.brands.findFirst({
    where: eq(brands.id, brandId),
  });
  if (!existing) return { error: "La marca no existe." };

  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!parsed.success) {
    return { error: "El nombre debe tener entre 2 y 120 caracteres." };
  }

  const slug =
    parsed.data === existing.name
      ? existing.slug
      : await uniqueBrandSlug(parsed.data, brandId);

  await db
    .update(brands)
    .set({ name: parsed.data, slug })
    .where(eq(brands.id, brandId));

  revalidatePath("/admin/marcas");
  revalidatePath("/admin/productos");
  revalidatePath("/");
  redirect("/admin/marcas");
}

export async function deleteBrand(brandId: number): Promise<void> {
  await requireAdmin();
  await db.delete(brands).where(eq(brands.id, brandId));

  revalidatePath("/admin/marcas");
  revalidatePath("/admin/productos");
  revalidatePath("/");
}
