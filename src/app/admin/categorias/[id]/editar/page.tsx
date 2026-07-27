import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { CategoryForm } from "@/components/admin/category-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Editar categoría | Admin",
};

export default async function EditarCategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoryId = Number(id);
  if (!Number.isInteger(categoryId)) notFound();

  const category = await db.query.categories.findFirst({
    where: eq(categories.id, categoryId),
  });
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Editar categoría</h1>
      <CategoryForm category={category} />
    </div>
  );
}
