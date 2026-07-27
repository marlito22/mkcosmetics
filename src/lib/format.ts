const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatCOP(value: number): string {
  return copFormatter.format(value);
}

export function imageUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder-product.svg";
  return `/api/images/${path}`;
}
