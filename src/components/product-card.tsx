import Link from "next/link";
import Image from "next/image";
import { Palette } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCOP, imageUrl } from "@/lib/format";
import { AddToCartButton } from "@/components/add-to-cart-button";
import type { ProductWithRelations } from "@/lib/queries";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const image = product.images[0]?.path ?? null;
  const hasVariants = product.variants.length > 0;

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
        {hasVariants ? (
          <Button asChild className="mt-2 rounded-full">
            <Link href={`/producto/${product.slug}`}>
              <Palette className="size-4" />
              Ver tonos
            </Link>
          </Button>
        ) : (
          <AddToCartButton product={product} className="mt-2" />
        )}
      </CardContent>
    </Card>
  );
}
