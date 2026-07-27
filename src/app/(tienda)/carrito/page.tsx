"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore, cartTotal } from "@/lib/cart-store";
import { formatCOP, imageUrl } from "@/lib/format";
import { useEffect, useState } from "react";

export default function CarritoPage() {
  const { items, setQuantity, removeItem, clear } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-24 text-muted-foreground">
        <ShoppingBag className="size-14 opacity-40" />
        <p className="text-lg">Tu carrito está vacío</p>
        <Button asChild>
          <Link href="/tienda">Ver catálogo</Link>
        </Button>
      </div>
    );
  }

  const total = cartTotal(items);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Tu carrito</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.productId}>
              <Card className="py-0">
                <CardContent className="flex gap-4 p-4">
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={imageUrl(item.imagePath)}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/producto/${item.slug}`}
                          className="font-medium leading-snug hover:text-primary"
                        >
                          {item.name}
                        </Link>
                        {item.brand && (
                          <p className="text-xs text-muted-foreground">
                            {item.brand}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        aria-label={`Quitar ${item.name}`}
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          aria-label="Restar uno"
                          onClick={() =>
                            setQuantity(item.productId, item.quantity - 1)
                          }
                        >
                          <Minus className="size-3.5" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          aria-label="Sumar uno"
                          onClick={() =>
                            setQuantity(item.productId, item.quantity + 1)
                          }
                        >
                          <Plus className="size-3.5" />
                        </Button>
                      </div>
                      <span className="font-semibold">
                        {formatCOP(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>

        <Card className="h-fit">
          <CardContent className="space-y-4 p-6">
            <h2 className="text-lg font-semibold">Resumen del pedido</h2>
            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between text-muted-foreground"
                >
                  <span className="line-clamp-1 pr-2">
                    {item.quantity} × {item.name}
                  </span>
                  <span className="shrink-0">
                    {formatCOP(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{formatCOP(total)}</span>
            </div>
            <Button asChild size="lg" className="w-full">
              <Link href="/checkout">Hacer pedido</Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={clear}
            >
              Vaciar carrito
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
