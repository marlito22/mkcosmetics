import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { CatalogFilters } from "@/components/catalog-filters";
import { getBrands, getCategories, getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catálogo",
};

type SearchParams = Promise<{
  categoria?: string;
  marca?: string;
  q?: string;
  pagina?: string;
}>;

function pageUrl(
  params: { categoria?: string; marca?: string; q?: string },
  page: number
) {
  const sp = new URLSearchParams();
  if (params.categoria) sp.set("categoria", params.categoria);
  if (params.marca) sp.set("marca", params.marca);
  if (params.q) sp.set("q", params.q);
  if (page > 1) sp.set("pagina", String(page));
  const qs = sp.toString();
  return qs ? `/tienda?${qs}` : "/tienda";
}

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const [result, cats, brs] = await Promise.all([
    getProducts({
      categoria: params.categoria,
      marca: params.marca,
      q: params.q,
      pagina: Number(params.pagina) || 1,
    }),
    getCategories(),
    getBrands(),
  ]);

  const activeCategory = cats.find((c) => c.slug === params.categoria);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            {activeCategory ? activeCategory.name : "Catálogo"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {params.q
              ? `Resultados para "${params.q}" — ${result.total} producto${result.total === 1 ? "" : "s"}`
              : `${result.total} producto${result.total === 1 ? "" : "s"}`}
          </p>
        </div>
        <CatalogFilters categories={cats} brands={brs} />
      </div>

      {result.items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-muted-foreground">
          <SearchX className="size-12 opacity-40" />
          <p>No encontramos productos con esos filtros.</p>
          <Button asChild variant="outline">
            <Link href="/tienda">Ver todo el catálogo</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {result.items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {result.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <Button
            asChild={result.page > 1}
            variant="outline"
            size="icon"
            disabled={result.page <= 1}
            aria-label="Página anterior"
          >
            {result.page > 1 ? (
              <Link href={pageUrl(params, result.page - 1)}>
                <ChevronLeft className="size-4" />
              </Link>
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </Button>
          <span className="px-3 text-sm text-muted-foreground">
            Página {result.page} de {result.totalPages}
          </span>
          <Button
            asChild={result.page < result.totalPages}
            variant="outline"
            size="icon"
            disabled={result.page >= result.totalPages}
            aria-label="Página siguiente"
          >
            {result.page < result.totalPages ? (
              <Link href={pageUrl(params, result.page + 1)}>
                <ChevronRight className="size-4" />
              </Link>
            ) : (
              <ChevronRight className="size-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
