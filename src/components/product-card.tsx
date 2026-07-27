import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { formatCOP, imageUrl } from "@/lib/format";
import { AddToCartButton } from "@/components/add-to-cart-button";
import type { ProductWithRelations } from "@/lib/queries";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const image = product.images[0]?.path ?? null;

  return (
    <Card className="group overflow-hidden border-border/70 py-0 gap-0 transition-shadow hover:shadow-lg hover:shadow-primary/10">
      <Link
        href={`/producto/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        <Image
          src={imageUrl(image)}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <CardContent className="flex flex-col gap-1 p-4">
        {product.brand && (
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {product.brand.name}
          </span>
        )}
        <Link
          href={`/producto/${product.slug}`}
          className="line-clamp-2 text-sm font-medium leading-snug hover:text-primary"
        >
          {product.name}
        </Link>
        <span className="mt-1 text-base font-bold text-primary">
          {formatCOP(product.price)}
        </span>
        <AddToCartButton product={product} className="mt-2" />
      </CardContent>
    </Card>
  );
}
