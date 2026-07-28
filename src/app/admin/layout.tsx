import Link from "next/link";
import Image from "next/image";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/admin/productos" className="flex items-center gap-2">
              <Image
                src="/logo-mark.png"
                alt="MK Cosmetics"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="font-bold">
                MK <span className="text-primary">Cosmetics</span>
              </span>
              <span className="ml-1 rounded bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                Admin
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/admin/productos"
                className="text-muted-foreground hover:text-primary"
              >
                Productos
              </Link>
              <Link
                href="/admin/categorias"
                className="text-muted-foreground hover:text-primary"
              >
                Categorías
              </Link>
              <Link
                href="/admin/marcas"
                className="text-muted-foreground hover:text-primary"
              >
                Marcas
              </Link>
            </nav>
          </div>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Ver tienda →
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
