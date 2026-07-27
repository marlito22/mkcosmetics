"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCategory,
  updateCategory,
  type CatalogFormState,
} from "@/lib/actions/catalog";
import type { Category } from "@/db/schema";

export function CategoryForm({ category }: { category?: Category }) {
  const action = category
    ? updateCategory.bind(null, category.id)
    : createCategory;
  const [state, formAction, pending] = useActionState<
    CatalogFormState,
    FormData
  >(action, {});

  return (
    <form action={formAction}>
      <Card>
        <CardContent className="grid gap-5 p-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              name="name"
              required
              minLength={2}
              maxLength={120}
              defaultValue={category?.name}
            />
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Guardando...
                </>
              ) : category ? (
                "Guardar cambios"
              ) : (
                "Crear categoría"
              )}
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/categorias">Cancelar</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
