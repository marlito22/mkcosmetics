import { z } from "zod";

export const checkoutSchema = z.object({
  name: z
    .string()
    .min(3, "Escribe tu nombre completo")
    .max(200, "Máximo 200 caracteres"),
  email: z.email("Escribe un correo válido").max(200),
  phone: z
    .string()
    .min(7, "Escribe un teléfono válido")
    .max(40, "Máximo 40 caracteres"),
  address: z
    .string()
    .min(5, "Escribe tu dirección de entrega")
    .max(300, "Máximo 300 caracteres"),
  city: z.string().min(3, "Escribe tu ciudad").max(120, "Máximo 120 caracteres"),
  notes: z.string().max(1000, "Máximo 1000 caracteres").optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const orderItemsSchema = z
  .array(
    z.object({
      productId: z.number().int().positive(),
      variantId: z.number().int().positive().nullable().optional(),
      quantity: z.number().int().min(1).max(100),
    })
  )
  .min(1, "El carrito está vacío")
  .max(100);

export type OrderItemsInput = z.infer<typeof orderItemsSchema>;
