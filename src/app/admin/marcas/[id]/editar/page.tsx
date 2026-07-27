import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { brands } from "@/db/schema";
import { BrandForm } from "@/components/admin/brand-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Editar marca | Admin",
};

export default async function EditarMarcaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brandId = Number(id);
  if (!Number.isInteger(brandId)) notFound();

  const brand = await db.query.brands.findFirst({
    where: eq(brands.id, brandId),
  });
  if (!brand) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Editar marca</h1>
      <BrandForm brand={brand} />
    </div>
  );
}
