"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Suspense, useState } from "react";

function ProductSearchInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/admin/productos?q=${encodeURIComponent(q)}` : "/admin/productos");
  }

  return (
    <form onSubmit={onSubmit} className="relative w-full sm:max-w-xs">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Buscar productos..."
        className="pl-9"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}

export function ProductSearch() {
  return (
    <Suspense>
      <ProductSearchInner />
    </Suspense>
  );
}
