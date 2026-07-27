"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { imageUrl } from "@/lib/format";
import {
  createProduct,
  updateProduct,
  type ProductFormState,
} from "@/lib/actions/products";
import type { Brand, Category, Product, ProductImage } from "@/db/schema";

type ProductWithImages = Product & { images: ProductImage[] };

export function ProductForm({
  categories,
  brands,
  product,
}: {
  categories: Category[];
  brands: Brand[];
  product?: ProductWithImages;
}) {
  const action = product
    ? updateProduct.bind(null, product.id)
    : createProduct;
  const [state, formAction, pending] = useActionState<
    ProductFormState,
    FormData
  >(action, {});

  return (
    <form action={formAction}>
      <Card>
        <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              name="name"
              required
              minLength={3}
              defaultValue={product?.name}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price">Precio (COP) *</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min={0}
              step={100}
              required
              defaultValue={product?.price}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image">Imagen (JPG, PNG o WebP)</Label>
            <Input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" />
            {product?.images[0] && (
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={imageUrl(product.images[0].path)}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                Imagen actual (súbela de nuevo para reemplazarla)
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="categoryId">Categoría</Label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={product?.categoryId ?? ""}
              className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
            >
              <option value="">Sin categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="brandId">Marca</Label>
            <select
              id="brandId"
              name="brandId"
              defaultValue={product?.brandId ?? ""}
              className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
            >
              <option value="">Sin marca</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={product?.description ?? ""}
            />
          </div>

          <div className="flex items-center gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="available"
                defaultChecked={product?.available ?? true}
                className="size-4 accent-primary"
              />
              Disponible en la tienda
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={product?.featured ?? false}
                className="size-4 accent-primary"
              />
              Destacado en la portada
            </label>
          </div>

          {state?.error && (
            <p className="text-sm text-destructive sm:col-span-2">
              {state.error}
            </p>
          )}

          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Guardando...
                </>
              ) : product ? (
                "Guardar cambios"
              ) : (
                "Crear producto"
              )}
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/productos">Cancelar</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
