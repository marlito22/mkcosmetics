"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/add-to-cart-button";
import type { ProductWithRelations } from "@/lib/queries";

export function ProductPurchase({
  product,
}: {
  product: ProductWithRelations;
}) {
  const [quantity, setQuantity] = useState(1);

  return (
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
      <AddToCartButton product={product} quantity={quantity} size="lg" />
    </div>
  );
}
