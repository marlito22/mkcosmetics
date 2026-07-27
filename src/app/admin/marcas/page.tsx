import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db } from "@/db";
import { brands } from "@/db/schema";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteBrandButton } from "@/components/admin/delete-brand-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marcas | Admin",
};

export default async function AdminMarcasPage() {
  const items = await db.query.brands.findMany({
    with: { products: { columns: { id: true } } },
    orderBy: asc(brands.name),
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Marcas ({items.length})</h1>
        <Button asChild>
          <Link href="/admin/marcas/nueva">
            <Plus className="size-4" /> Nueva marca
          </Link>
        </Button>
      </div>

      <Card className="py-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Productos</TableHead>
                <TableHead className="w-32 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {b.slug}
                  </TableCell>
                  <TableCell className="text-right">
                    {b.products.length}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/marcas/${b.id}/editar`}>
                          Editar
                        </Link>
                      </Button>
                      <DeleteBrandButton
                        brandId={b.id}
                        brandName={b.name}
                        productCount={b.products.length}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No hay marcas todavía.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
