"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createBrand,
  updateBrand,
  type CatalogFormState,
} from "@/lib/actions/catalog";
import type { Brand } from "@/db/schema";

export function BrandForm({ brand }: { brand?: Brand }) {
  const action = brand ? updateBrand.bind(null, brand.id) : createBrand;
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
              defaultValue={brand?.name}
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
              ) : brand ? (
                "Guardar cambios"
              ) : (
                "Crear marca"
              )}
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/marcas">Cancelar</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
