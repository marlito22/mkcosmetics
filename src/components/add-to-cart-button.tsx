"use client";

import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import type { ProductWithRelations } from "@/lib/queries";
import type { ProductVariant } from "@/db/schema";

export function AddToCartButton({
  product,
  quantity = 1,
  size = "sm",
  className,
  selectedVariant,
}: {
  product: ProductWithRelations;
  quantity?: number;
  size?: "sm" | "lg";
  className?: string;
  selectedVariant?: ProductVariant | null;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const requiresVariant = product.variants.length > 0;
  const disabled = requiresVariant && !selectedVariant;

  function handleAdd() {
    if (disabled) return;
    addItem(
      {
        productId: product.id,
        variantId: selectedVariant?.id ?? null,
        variantName: selectedVariant?.name ?? null,
        slug: product.slug,
        name: product.name,
        brand: product.brand?.name ?? null,
        price: product.price,
        imagePath:
          selectedVariant?.imagePath ?? product.images[0]?.path ?? null,
      },
      quantity
    );
    toast.success(`${product.name} agregado al carrito`);
  }

  return (
    <Button
      size={size}
      className={cn("rounded-full", className)}
      onClick={handleAdd}
      disabled={disabled}
    >
      <ShoppingBag className="size-4" />
      {disabled ? "Elige un tono" : "Agregar al carrito"}
    </Button>
  );
}
