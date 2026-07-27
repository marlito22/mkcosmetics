import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getBrands, getCategories } from "@/lib/queries";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Editar producto | Admin",
};

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const [product, cats, brs] = await Promise.all([
    db.query.products.findFirst({
      where: eq(products.id, productId),
      with: { images: true },
    }),
    getCategories(),
    getBrands(),
  ]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Editar producto</h1>
      <ProductForm categories={cats} brands={brs} product={product} />
    </div>
  );
}
