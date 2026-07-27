"use client";

import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import type { ProductWithRelations } from "@/lib/queries";

export function AddToCartButton({
  product,
  quantity = 1,
  size = "sm",
  className,
}: {
  product: ProductWithRelations;
  quantity?: number;
  size?: "sm" | "lg";
  className?: string;
}) {
  const addItem = useCartStore((s) => s.addItem);

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand?.name ?? null,
        price: product.price,
        imagePath: product.images[0]?.path ?? null,
      },
      quantity
    );
    toast.success(`${product.name} agregado al carrito`);
  }

  return (
    <Button size={size} className={cn("rounded-full", className)} onClick={handleAdd}>
      <ShoppingBag className="size-4" />
      Agregar al carrito
    </Button>
  );
}
