"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Brand, Category } from "@/db/schema";

const ALL = "__all__";

function CatalogFiltersInner({
  categories,
  brands,
}: {
  categories: Category[];
  brands: Brand[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoria = searchParams.get("categoria") ?? ALL;
  const marca = searchParams.get("marca") ?? ALL;
  const hasFilters =
    categoria !== ALL || marca !== ALL || !!searchParams.get("q");

  function applyFilter(key: "categoria" | "marca", value: string) {
    const sp = new URLSearchParams(searchParams.toString());
    if (value === ALL) sp.delete(key);
    else sp.set(key, value);
    sp.delete("pagina");
    const qs = sp.toString();
    router.push(qs ? `/tienda?${qs}` : "/tienda");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={categoria}
        onValueChange={(v) => applyFilter("categoria", v)}
      >
        <SelectTrigger className="w-44" aria-label="Filtrar por categoría">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todas las categorías</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.slug}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={marca} onValueChange={(v) => applyFilter("marca", v)}>
        <SelectTrigger className="w-40" aria-label="Filtrar por marca">
          <SelectValue placeholder="Marca" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todas las marcas</SelectItem>
          {brands.map((b) => (
            <SelectItem key={b.id} value={b.slug}>
              {b.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => router.push("/tienda")}
        >
          <X className="size-4" /> Limpiar
        </Button>
      )}
    </div>
  );
}

export function CatalogFilters(props: {
  categories: Category[];
  brands: Brand[];
}) {
  return (
    <Suspense>
      <CatalogFiltersInner {...props} />
    </Suspense>
  );
}
