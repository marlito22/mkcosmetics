import type { Metadata } from "next";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata: Metadata = {
  title: "Nueva categoría | Admin",
};

export default function NuevaCategoriaPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Nueva categoría</h1>
      <CategoryForm />
    </div>
  );
}
