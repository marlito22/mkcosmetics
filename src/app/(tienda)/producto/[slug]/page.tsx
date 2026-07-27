import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getProductBySlug, getProducts } from "@/lib/queries";
import { formatCOP, imageUrl } from "@/lib/format";
import { ProductPurchase } from "@/components/product-purchase";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.available) notFound();

  const related = product.category
    ? (
        await getProducts({ categoria: product.category.slug })
      ).items
        .filter((p) => p.id !== product.id)
        .slice(0, 4)
    : [];

  const mainImage = product.images[0]?.path ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Migas de pan */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          Inicio
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href="/tienda" className="hover:text-primary">
          Catálogo
        </Link>
        {product.category && (
          <>
            <ChevronRight className="size-3.5" />
            <Link
              href={`/tienda?categoria=${product.category.slug}`}
              className="hover:text-primary"
            >
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted">
          <Image
            src={imageUrl(mainImage)}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {product.brand && (
              <Badge variant="secondary" className="uppercase tracking-wide">
                {product.brand.name}
              </Badge>
            )}
            {product.category && (
              <Badge variant="outline">{product.category.name}</Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>
          <p className="text-3xl font-bold text-primary">
            {formatCOP(product.price)}
          </p>
          {product.description && (
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}

          <ProductPurchase product={product} />

          <p className="text-sm text-muted-foreground">
            Venta por catálogo: al confirmar tu pedido recibirás una copia por
            correo y te contactaremos para coordinar entrega y pago.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold sm:text-2xl">
            También te puede gustar
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
