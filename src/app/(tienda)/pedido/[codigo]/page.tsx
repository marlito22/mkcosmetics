import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCOP } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PedidoPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const order = await db.query.orders.findFirst({
    where: eq(orders.code, codigo.toUpperCase()),
    with: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-16 text-primary" />
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
          ¡Pedido recibido!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Tu pedido <span className="font-semibold text-foreground">{order.code}</span>{" "}
          fue registrado. Enviamos una copia a{" "}
          <span className="font-semibold text-foreground">
            {order.customerEmail}
          </span>{" "}
          y pronto te contactaremos para coordinar la entrega y el pago.
        </p>
      </div>

      <Card className="mt-8">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Resumen</h2>
          <div className="space-y-2 text-sm">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="pr-2">
                  {item.quantity} × {item.productName}
                  {item.variantName ? ` (${item.variantName})` : ""}
                </span>
                <span className="shrink-0 text-muted-foreground">
                  {formatCOP(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{formatCOP(order.total)}</span>
          </div>
          <Separator />
          <div className="grid gap-1 text-sm text-muted-foreground">
            <span>{order.customerName}</span>
            <span>{order.customerPhone}</span>
            <span>
              {order.customerAddress}, {order.customerCity}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <Button asChild>
          <Link href="/tienda">Seguir comprando</Link>
        </Button>
      </div>
    </div>
  );
}
