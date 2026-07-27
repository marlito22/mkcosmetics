"use server";

import { randomBytes } from "node:crypto";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { sendOrderEmails } from "@/lib/email";
import {
  checkoutSchema,
  orderItemsSchema,
  type CheckoutInput,
  type OrderItemsInput,
} from "@/lib/validation";

function generateOrderCode(): string {
  return `MK-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export type CreateOrderResult =
  | { ok: true; code: string }
  | { ok: false; error: string };

export async function createOrder(
  customer: CheckoutInput,
  items: OrderItemsInput
): Promise<CreateOrderResult> {
  const parsedCustomer = checkoutSchema.safeParse(customer);
  if (!parsedCustomer.success) {
    return { ok: false, error: "Revisa los datos del formulario." };
  }
  const parsedItems = orderItemsSchema.safeParse(items);
  if (!parsedItems.success) {
    return { ok: false, error: "El carrito está vacío o es inválido." };
  }

  // Revalida productos y precios contra la base de datos
  const ids = parsedItems.data.map((i) => i.productId);
  const dbProducts = await db.query.products.findMany({
    where: inArray(products.id, ids),
  });
  const productMap = new Map(dbProducts.map((p) => [p.id, p]));

  const lines: { productId: number; productName: string; unitPrice: number; quantity: number }[] = [];
  for (const item of parsedItems.data) {
    const product = productMap.get(item.productId);
    if (!product || !product.available) {
      return {
        ok: false,
        error: "Uno de los productos del carrito ya no está disponible. Actualiza tu carrito.",
      };
    }
    lines.push({
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      quantity: item.quantity,
    });
  }

  const total = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const data = parsedCustomer.data;
  const code = generateOrderCode();

  try {
    await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          code,
          customerName: data.name,
          customerEmail: data.email,
          customerPhone: data.phone,
          customerAddress: data.address,
          customerCity: data.city,
          notes: data.notes || null,
          total,
        })
        .returning();

      await tx.insert(orderItems).values(
        lines.map((l) => ({ ...l, orderId: order.id }))
      );
    });
  } catch (err) {
    console.error("Error creando el pedido:", err);
    return { ok: false, error: "No pudimos registrar tu pedido. Intenta de nuevo." };
  }

  // El correo no bloquea el pedido: si falla, el pedido ya quedó registrado
  try {
    await sendOrderEmails({
      code,
      customerName: data.name,
      customerEmail: data.email,
      customerPhone: data.phone,
      customerAddress: data.address,
      customerCity: data.city,
      notes: data.notes || null,
      total,
      items: lines,
    });
  } catch (err) {
    console.error(`Error enviando correos del pedido ${code}:`, err);
  }

  return { ok: true, code };
}
