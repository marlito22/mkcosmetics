import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { asc } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db } from "@/db";
import { products } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { formatCOP, imageUrl } from "@/lib/format";
import { logoutAdmin } from "@/lib/actions/auth";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Productos | Admin",
};

export default async function AdminProductosPage() {
  const items = await db.query.products.findMany({
    with: { images: true, brand: true, category: true },
    orderBy: asc(products.name),
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Productos ({items.length})</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/productos/nuevo">
              <Plus className="size-4" /> Nuevo producto
            </Link>
          </Button>
          <form action={logoutAdmin}>
            <Button variant="outline" type="submit">
              Cerrar sesión
            </Button>
          </form>
        </div>
      </div>

      <Card className="py-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16"></TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-32 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={imageUrl(p.images[0]?.path)}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {p.name}
                    {p.featured && (
                      <Badge variant="secondary" className="ml-2">
                        Destacado
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.category?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.brand?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCOP(p.price)}
                  </TableCell>
                  <TableCell>
                    {p.available ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        Disponible
                      </Badge>
                    ) : (
                      <Badge variant="outline">Oculto</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/productos/${p.id}/editar`}>
                          Editar
                        </Link>
                      </Button>
                      <DeleteProductButton
                        productId={p.id}
                        productName={p.name}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
