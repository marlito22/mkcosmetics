import { db } from "@/db";
import { brands, categories, products } from "@/db/schema";
import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";

export const PRODUCTS_PER_PAGE = 12;

export async function getCategories() {
  return db.query.categories.findMany({ orderBy: asc(categories.name) });
}

export async function getBrands() {
  return db.query.brands.findMany({ orderBy: asc(brands.name) });
}

export async function getFeaturedProducts(limit = 8) {
  return db.query.products.findMany({
    where: and(eq(products.featured, true), eq(products.available, true)),
    with: { images: true, brand: true, category: true },
    orderBy: desc(products.createdAt),
    limit,
  });
}

export type ProductFilters = {
  categoria?: string;
  marca?: string;
  q?: string;
  pagina?: number;
};

export async function getProducts(filters: ProductFilters) {
  const conditions: SQL[] = [eq(products.available, true)];

  if (filters.categoria) {
    const cat = await db.query.categories.findFirst({
      where: eq(categories.slug, filters.categoria),
    });
    conditions.push(eq(products.categoryId, cat?.id ?? -1));
  }
  if (filters.marca) {
    const br = await db.query.brands.findFirst({
      where: eq(brands.slug, filters.marca),
    });
    conditions.push(eq(products.brandId, br?.id ?? -1));
  }
  if (filters.q) {
    const term = `%${filters.q.trim()}%`;
    const search = or(
      ilike(products.name, term),
      ilike(products.description, term)
    );
    if (search) conditions.push(search);
  }

  const where = and(...conditions);
  const page = Math.max(1, filters.pagina ?? 1);

  const [items, [{ total }]] = await Promise.all([
    db.query.products.findMany({
      where,
      with: { images: true, brand: true, category: true },
      orderBy: desc(products.createdAt),
      limit: PRODUCTS_PER_PAGE,
      offset: (page - 1) * PRODUCTS_PER_PAGE,
    }),
    db.select({ total: count() }).from(products).where(where),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE)),
  };
}

export async function getProductBySlug(slug: string) {
  return db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: { images: true, brand: true, category: true },
  });
}

export type ProductWithRelations = NonNullable<
  Awaited<ReturnType<typeof getProductBySlug>>
>;
