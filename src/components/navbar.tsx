import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/queries";
import { SearchBar } from "@/components/search-bar";
import { CartButton } from "@/components/cart-button";

export async function Navbar() {
  const cats = await getCategories();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/logo-mark.png"
              alt="MK Cosmetics"
              width={40}
              height={40}
              className="rounded-full"
              priority
            />
            <span className="text-xl font-bold tracking-tight">
              MK <span className="text-primary">Cosmetics</span>
            </span>
          </Link>

          <div className="hidden md:block flex-1 max-w-md">
            <SearchBar />
          </div>

          <CartButton />
        </div>

        <div className="md:hidden pb-3">
          <SearchBar />
        </div>

        <nav className="flex gap-1 overflow-x-auto pb-2 -mx-1 px-1">
          <Link
            href="/tienda"
            className="whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Todo
          </Link>
          {cats.map((c) => (
            <Link
              key={c.id}
              href={`/tienda?categoria=${c.slug}`}
              className="whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
