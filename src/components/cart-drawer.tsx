"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCartStore, cartTotal } from "@/lib/cart-store";
import { formatCOP, imageUrl } from "@/lib/format";

export function CartDrawer() {
  const { items, isOpen, closeCart, setQuantity, removeItem } = useCartStore();
  const total = cartTotal(items);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Tu carrito</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
            <ShoppingBag className="size-12 opacity-40" />
            <p>Tu carrito está vacío</p>
            <Button asChild variant="outline" onClick={closeCart}>
              <Link href="/tienda">Ver catálogo</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li
                    key={`${item.productId}-${item.variantId ?? "base"}`}
                    className="flex gap-3 py-4"
                  >
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={imageUrl(item.imagePath)}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <Link
                        href={`/producto/${item.slug}`}
                        onClick={closeCart}
                        className="text-sm font-medium leading-tight hover:text-primary"
                      >
                        {item.name}
                      </Link>
                      {(item.brand || item.variantName) && (
                        <span className="text-xs text-muted-foreground">
                          {[item.brand, item.variantName]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      )}
                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-7"
                            aria-label="Restar uno"
                            onClick={() =>
                              setQuantity(
                                item.productId,
                                item.variantId,
                                item.quantity - 1
                              )
                            }
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="w-7 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-7"
                            aria-label="Sumar uno"
                            onClick={() =>
                              setQuantity(
                                item.productId,
                                item.variantId,
                                item.quantity + 1
                              )
                            }
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatCOP(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 self-start text-muted-foreground hover:text-destructive"
                      aria-label={`Quitar ${item.name}`}
                      onClick={() => removeItem(item.productId, item.variantId)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <SheetFooter className="gap-3">
              <Separator />
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatCOP(total)}</span>
              </div>
              <Button asChild size="lg" onClick={closeCart}>
                <Link href="/checkout">Hacer pedido</Link>
              </Button>
              <Button asChild variant="outline" onClick={closeCart}>
                <Link href="/carrito">Ver carrito completo</Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
