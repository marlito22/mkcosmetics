"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCartStore, cartTotal } from "@/lib/cart-store";
import { formatCOP } from "@/lib/format";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation";
import { createOrder } from "@/lib/actions/orders";

export function CheckoutForm() {
  const router = useRouter();
  const { items, clear } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => setMounted(true), []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
  });

  if (!mounted) return null;

  if (items.length === 0 && !submitting) {
    return (
      <div className="mt-16 flex flex-col items-center gap-4 text-muted-foreground">
        <ShoppingBag className="size-14 opacity-40" />
        <p>Tu carrito está vacío. Agrega productos para hacer un pedido.</p>
        <Button asChild>
          <Link href="/tienda">Ver catálogo</Link>
        </Button>
      </div>
    );
  }

  const total = cartTotal(items);

  async function onSubmit(data: CheckoutInput) {
    setSubmitting(true);
    try {
      const result = await createOrder(
        data,
        items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      );
      if (result.ok) {
        clear();
        router.push(`/pedido/${result.code}`);
      } else {
        toast.error(result.error);
        setSubmitting(false);
      }
    } catch {
      toast.error("Ocurrió un error al enviar el pedido. Intenta de nuevo.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]"
    >
      <Card className="h-fit">
        <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="name">Nombre completo *</Label>
            <Input id="name" autoComplete="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Correo electrónico *</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Teléfono / WhatsApp *</Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="address">Dirección de entrega *</Label>
            <Input
              id="address"
              autoComplete="street-address"
              {...register("address")}
            />
            {errors.address && (
              <p className="text-sm text-destructive">
                {errors.address.message}
              </p>
            )}
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="city">Ciudad *</Label>
            <Input id="city" autoComplete="address-level2" {...register("city")} />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city.message}</p>
            )}
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="notes">Notas del pedido (opcional)</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Ej: entregar en la tarde, tono preferido, etc."
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Tu pedido</h2>
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
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Enviando pedido...
              </>
            ) : (
              "Confirmar pedido"
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            Al confirmar recibirás una copia del pedido en tu correo. El pago y
            la entrega se coordinan directamente contigo.
          </p>
        </CardContent>
      </Card>
    </form>
  );
}
