"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: number;
  variantId: number | null;
  variantName: string | null;
  slug: string;
  name: string;
  brand: string | null;
  price: number;
  imagePath: string | null;
  quantity: number;
};

function sameLine(
  a: { productId: number; variantId: number | null },
  b: { productId: number; variantId: number | null }
) {
  return a.productId === b.productId && a.variantId === b.variantId;
}

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: number, variantId: number | null) => void;
  setQuantity: (
    productId: number,
    variantId: number | null,
    quantity: number
  ) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, item));
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, item)
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, { ...item, quantity }], isOpen: true };
        }),
      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !sameLine(i, { productId, variantId })
          ),
        })),
      setQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (i) => !sameLine(i, { productId, variantId })
                )
              : state.items.map((i) =>
                  sameLine(i, { productId, variantId })
                    ? { ...i, quantity }
                    : i
                ),
        })),
      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: "mk-cart",
      version: 1,
      partialize: (state) => ({ items: state.items }),
      migrate: (persistedState) => {
        const state = persistedState as { items?: CartItem[] } | undefined;
        return {
          items: (state?.items ?? []).map((i) => ({
            ...i,
            variantId: i.variantId ?? null,
            variantName: i.variantName ?? null,
          })),
        };
      },
    }
  )
);

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
