import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <span className="font-bold">MK Cosmetics</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Maquillaje y cosméticos por catálogo. Haz tu pedido en línea y te
              contactamos para coordinar la entrega y el pago.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Enlaces</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/tienda" className="hover:text-primary">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/carrito" className="hover:text-primary">
                  Mi carrito
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Contacto</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Correo: ep.smartbusiness@gmail.com</li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} MK Cosmetics. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
