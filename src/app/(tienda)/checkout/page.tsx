import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = {
  title: "Finalizar pedido",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Finalizar pedido</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Completa tus datos y te enviaremos una copia del pedido por correo.
      </p>
      <CheckoutForm />
    </div>
  );
}
