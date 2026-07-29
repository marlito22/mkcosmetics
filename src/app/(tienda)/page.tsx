import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { getBrands, getFeaturedProducts } from "@/lib/queries";
import { imageUrl } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, brandList] = await Promise.all([
    getFeaturedProducts(8),
    getBrands(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4">
      {/* Hero */}
      <section className="mt-6 text-center">
        <h1 className="sr-only">Tu belleza, a un clic de distancia</h1>
        <div className="relative h-64 overflow-hidden rounded-3xl sm:h-96">
          <Image
            src="/hero-banner.jpg"
            alt="MK Cosmetics — Realza tu belleza, expresa tu esencia"
            fill
            priority
            className="object-fill"
          />
        </div>
        <Button
          asChild
          size="lg"
          className="mt-6 rounded-full font-semibold"
        >
          <Link href="/tienda">
            Ver catálogo <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>

      {/* Marcas */}
      <section className="mt-14">
        <h2 className="text-xl font-bold sm:text-2xl">Compra por marca</h2>
        <div className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {brandList.map((b) => (
            <Link
              key={b.id}
              href={`/tienda?marca=${b.slug}`}
              className="group flex flex-col items-center gap-2 text-center"
            >
              <div className="relative size-20 overflow-hidden rounded-full border border-border bg-secondary/60 transition-colors group-hover:border-primary sm:size-24">
                <Image
                  src={imageUrl(b.imagePath)}
                  alt={b.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <span className="text-sm font-medium">{b.name}</span>
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
