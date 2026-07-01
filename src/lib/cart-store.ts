"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "./types";

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (partNumber: string) => void;
  updateQuantity: (partNumber: string, quantity: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.partNumber === item.partNumber
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.partNumber === item.partNumber
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        });
      },
      removeItem: (partNumber) =>
        set((state) => ({
          items: state.items.filter((i) => i.partNumber !== partNumber),
        })),
      updateQuantity: (partNumber, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.partNumber !== partNumber)
              : state.items.map((i) =>
                  i.partNumber === partNumber ? { ...i, quantity } : i
                ),
        })),
      clear: () => set({ items: [] }),
      total: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "trillick-cart" }
  )
);
