"use client";

import { useState } from "react";
import Image from "next/image";
import { imageUrl } from "@/lib/format";
import type { ProductImage } from "@/db/schema";

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const active = images[selectedIndex] ?? images[0] ?? null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted">
        <Image
          src={imageUrl(active?.path ?? null)}
          alt={productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`relative size-16 overflow-hidden rounded-xl border-2 transition-colors ${
                i === selectedIndex
                  ? "border-primary"
                  : "border-transparent hover:border-border"
              }`}
              aria-label={`Imagen ${i + 1} de ${productName}`}
            >
              <Image
                src={imageUrl(img.path)}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
