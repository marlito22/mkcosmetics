"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { imageUrl } from "@/lib/format";
import type { ProductWithRelations } from "@/lib/queries";

export function ProductPurchase({
  product,
}: {
  product: ProductWithRelations;
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null
  );
  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      {product.variants.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">
            Tono{selectedVariant ? `: ${selectedVariant.name}` : ""}
          </span>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariantId(v.id)}
                className={`relative size-14 overflow-hidden rounded-full border-2 transition-colors ${
                  selectedVariantId === v.id
                    ? "border-primary"
                    : "border-transparent hover:border-border"
                }`}
                aria-label={v.name}
                title={v.name}
              >
                <Image
                  src={imageUrl(v.imagePath)}
                  alt={v.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-border px-2 py-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full"
            aria-label="Restar uno"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Minus className="size-4" />
          </Button>
          <span className="w-8 text-center font-medium">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full"
            aria-label="Sumar uno"
            onClick={() => setQuantity((q) => q + 1)}
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <AddToCartButton
          product={product}
          quantity={quantity}
          size="lg"
          selectedVariant={selectedVariant}
        />
      </div>
    </div>
  );
}
