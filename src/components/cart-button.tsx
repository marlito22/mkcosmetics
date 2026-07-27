"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, cartCount } from "@/lib/cart-store";
import { CartDrawer } from "@/components/cart-drawer";
import { useEffect, useState } from "react";

export function CartButton() {
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  // Evita desajuste de hidratación: el carrito vive en localStorage
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const count = mounted ? cartCount(items) : 0;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        aria-label="Abrir carrito"
        onClick={openCart}
      >
        <ShoppingBag className="size-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Button>
      <CartDrawer />
    </>
  );
}
