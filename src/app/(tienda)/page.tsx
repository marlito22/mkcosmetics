import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { getCategories, getFeaturedProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, cats] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4">
      {/* Hero */}
      <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-r from-primary/90 to-pink-400 px-8 py-16 text-center text-primary-foreground sm:py-24">
        <h1 className="text-3xl font-bold sm:text-5xl">
          Tu belleza, a un clic de distancia
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base opacity-90">
          Descubre nuestro catálogo de maquillaje y cosméticos. Arma tu pedido
          en línea y te lo confirmamos por correo.
        </p>
        <Button
          asChild
          size="lg"
          variant="secondary"
          className="mt-8 rounded-full font-semibold"
        >
          <Link href="/tienda">
            Ver catálogo <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>

      {/* Categorías */}
      <section className="mt-14">
        <h2 className="text-xl font-bold sm:text-2xl">Compra por categoría</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {cats.map((c) => (
            <Link
              key={c.id}
              href={`/tienda?categoria=${c.slug}`}
              className="flex items-center justify-center rounded-2xl border border-border bg-secondary/60 px-4 py-6 text-center text-sm font-medium transition-colors hover:border-primary hover:bg-accent hover:text-accent-foreground"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Destacados */}
      <section className="mt-14">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold sm:text-2xl">Productos destacados</h2>
          <Button asChild variant="ghost" className="text-primary">
            <Link href="/tienda">
              Ver todo <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mt-16 rounded-3xl bg-secondary/60 px-6 py-10">
        <h2 className="text-center text-xl font-bold sm:text-2xl">
          ¿Cómo funciona?
        </h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Explora el catálogo",
              text: "Navega por categorías o busca tu producto favorito.",
            },
            {
              step: "2",
              title: "Arma tu pedido",
              text: "Agrega productos al carrito y confirma con tus datos.",
            },
            {
              step: "3",
              title: "Recibe la confirmación",
              text: "Te llega una copia del pedido por correo y te contactamos para coordinar entrega y pago.",
            },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {s.step}
              </div>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
