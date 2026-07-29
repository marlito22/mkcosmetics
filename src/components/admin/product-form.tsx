"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Plus, X } from "lucide-react";
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
import type {
  Brand,
  Category,
  Product,
  ProductImage,
  ProductVariant,
} from "@/db/schema";

const MAX_GENERAL_IMAGES = 6;
const MAX_VARIANTS = 10;

type ProductWithMedia = Product & {
  images: ProductImage[];
  variants: ProductVariant[];
};

type VariantRow = {
  key: string;
  id: number | null;
  name: string;
  existingImagePath: string | null;
  newImagePreview: string | null;
};

function makeKey() {
  return Math.random().toString(36).slice(2);
}

export function ProductForm({
  categories,
  brands,
  product,
}: {
  categories: Category[];
  brands: Brand[];
  product?: ProductWithMedia;
}) {
  const action = product
    ? updateProduct.bind(null, product.id)
    : createProduct;
  const [state, formAction, pending] = useActionState<
    ProductFormState,
    FormData
  >(action, {});

  // --- Galería general ---
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const generalInputRef = useRef<HTMLInputElement>(null);

  const remainingExisting = (product?.images ?? []).filter(
    (img) => !removedImageIds.includes(img.id)
  ).length;
  const generalSlotsUsed = remainingExisting + newImages.length;

  function syncGeneralInput(files: File[]) {
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));
    if (generalInputRef.current) generalInputRef.current.files = dt.files;
  }

  function handleGeneralFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    const remainingSlots = MAX_GENERAL_IMAGES - generalSlotsUsed;
    const combined = [...newImages, ...picked].slice(
      0,
      newImages.length + Math.max(0, remainingSlots)
    );
    setNewImages(combined);
    syncGeneralInput(combined);
  }

  function removeNewImage(index: number) {
    const combined = newImages.filter((_, i) => i !== index);
    setNewImages(combined);
    syncGeneralInput(combined);
  }

  // --- Tonos ---
  const [variants, setVariants] = useState<VariantRow[]>(
    () =>
      product?.variants.map((v) => ({
        key: makeKey(),
        id: v.id,
        name: v.name,
        existingImagePath: v.imagePath,
        newImagePreview: null,
      })) ?? []
  );
  const [removedVariantIds, setRemovedVariantIds] = useState<number[]>([]);

  function addVariantRow() {
    setVariants((prev) => [
      ...prev,
      {
        key: makeKey(),
        id: null,
        name: "",
        existingImagePath: null,
        newImagePreview: null,
      },
    ]);
  }

  function removeVariantRow(row: VariantRow) {
    setVariants((prev) => prev.filter((v) => v.key !== row.key));
    if (row.id !== null) {
      setRemovedVariantIds((prev) => [...prev, row.id as number]);
    }
  }

  function updateVariantName(key: string, name: string) {
    setVariants((prev) =>
      prev.map((v) => (v.key === key ? { ...v, name } : v))
    );
  }

  function updateVariantImage(key: string, file: File | null) {
    setVariants((prev) =>
      prev.map((v) =>
        v.key === key
          ? {
              ...v,
              newImagePreview: file ? URL.createObjectURL(file) : null,
            }
          : v
      )
    );
  }

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

          {/* Galería general de imágenes */}
          <div className="grid gap-2 sm:col-span-2">
            <Label>
              Imágenes del producto ({generalSlotsUsed}/{MAX_GENERAL_IMAGES})
            </Label>
            <div className="flex flex-wrap gap-3">
              {product?.images
                .filter((img) => !removedImageIds.includes(img.id))
                .map((img) => (
                  <div key={img.id} className="relative size-20">
                    <div className="relative size-20 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={imageUrl(img.path)}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setRemovedImageIds((prev) => [...prev, img.id])
                      }
                      className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                      aria-label="Quitar imagen"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              {newImages.map((file, i) => (
                <div key={i} className="relative size-20">
                  <div className="relative size-20 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                    aria-label="Quitar imagen"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
            {removedImageIds.map((id) => (
              <input key={id} type="hidden" name="removeImage" value={id} />
            ))}
            {generalSlotsUsed < MAX_GENERAL_IMAGES && (
              <Input
                ref={generalInputRef}
                type="file"
                name="newImages"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleGeneralFilesSelected}
              />
            )}
            <p className="text-xs text-muted-foreground">
              Hasta {MAX_GENERAL_IMAGES} imágenes (JPG, PNG o WebP, máx. 4MB cada una).
            </p>
          </div>

          {/* Tonos / variantes */}
          <div className="grid gap-3 sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label>
                Tonos ({variants.length}/{MAX_VARIANTS})
              </Label>
              {variants.length < MAX_VARIANTS && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariantRow}
                >
                  <Plus className="size-4" /> Agregar tono
                </Button>
              )}
            </div>

            {variants.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Si el producto viene en varios tonos (ej. un lipgloss con
                distintos colores), agrégalos aquí con nombre e imagen para
                que el cliente pueda elegir.
              </p>
            )}

            <div className="grid gap-3">
              {variants.map((row) => (
                <div
                  key={row.key}
                  className="flex items-center gap-3 rounded-md border border-border/70 p-3"
                >
                  <input type="hidden" name="variantId" value={row.id ?? ""} />
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                    {(row.newImagePreview || row.existingImagePath) && (
                      <Image
                        src={
                          row.newImagePreview ??
                          imageUrl(row.existingImagePath)
                        }
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="grid flex-1 gap-2 sm:grid-cols-2">
                    <Input
                      name="variantName"
                      placeholder="Nombre del tono (ej. Rosa Nude)"
                      value={row.name}
                      onChange={(e) =>
                        updateVariantName(row.key, e.target.value)
                      }
                      required
                    />
                    <Input
                      type="file"
                      name="variantImage"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) =>
                        updateVariantImage(
                          row.key,
                          e.target.files?.[0] ?? null
                        )
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariantRow(row)}
                    className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Quitar tono"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            {removedVariantIds.map((id) => (
              <input key={id} type="hidden" name="removeVariant" value={id} />
            ))}
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
