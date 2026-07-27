import type { Metadata } from "next";
import { BrandForm } from "@/components/admin/brand-form";

export const metadata: Metadata = {
  title: "Nueva marca | Admin",
};

export default function NuevaMarcaPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Nueva marca</h1>
      <BrandForm />
    </div>
  );
}
