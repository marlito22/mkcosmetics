import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin } from "lucide-react";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.868-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm.006 15.828h-.004c-1.642-.001-3.268-.416-4.712-1.205l-5.239 1.374 1.401-5.115c-.864-1.498-1.319-3.199-1.318-4.938.002-5.444 4.425-9.868 9.87-9.868 2.644 0 5.122 1.034 6.984 2.899 1.862 1.865 2.889 4.345 2.888 6.982-.002 5.445-4.425 9.869-9.87 9.869v.002z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.012-3.584.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <Image
                src="/logo-mark.png"
                alt="MK Cosmetics"
                width={32}
                height={32}
                className="rounded-full"
              />
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
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-primary" />
                <a
                  href="mailto:mkc10242@gmail.com"
                  className="hover:text-primary"
                >
                  mkc10242@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <WhatsAppIcon className="size-4 shrink-0 text-primary" />
                <a
                  href="https://wa.me/573218482963"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  321 848 2963
                </a>
              </li>
              <li className="flex items-center gap-2">
                <InstagramIcon className="size-4 shrink-0 text-primary" />
                <a
                  href="https://instagram.com/mkcosmetics.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  @mkcosmetics.co
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0 text-primary" />
                Sincelejo, Sucre
              </li>
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
