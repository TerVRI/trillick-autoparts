"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-store";

export function CartButton() {
  const count = useCart((s) => s.count());

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium hover:bg-stone-50"
    >
      <ShoppingCart className="h-4 w-4" />
      <span className="hidden sm:inline">Basket</span>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-xs text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
