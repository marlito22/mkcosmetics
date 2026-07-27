import type { Metadata } from "next";
import { getBrands, getCategories } from "@/lib/queries";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nuevo producto | Admin",
};

export default async function NuevoProductoPage() {
  const [cats, brs] = await Promise.all([getCategories(), getBrands()]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Nuevo producto</h1>
      <ProductForm categories={cats} brands={brs} />
    </div>
  );
}
