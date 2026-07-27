import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db } from "@/db";
import { categories } from "@/db/schema";
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
import { DeleteCategoryButton } from "@/components/admin/delete-category-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categorías | Admin",
};

export default async function AdminCategoriasPage() {
  const items = await db.query.categories.findMany({
    with: { products: { columns: { id: true } } },
    orderBy: asc(categories.name),
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Categorías ({items.length})</h1>
        <Button asChild>
          <Link href="/admin/categorias/nueva">
            <Plus className="size-4" /> Nueva categoría
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
              {items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.slug}
                  </TableCell>
                  <TableCell className="text-right">
                    {c.products.length}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/categorias/${c.id}/editar`}>
                          Editar
                        </Link>
                      </Button>
                      <DeleteCategoryButton
                        categoryId={c.id}
                        categoryName={c.name}
                        productCount={c.products.length}
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
                    No hay categorías todavía.
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
