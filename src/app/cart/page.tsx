"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { calculateShipping } from "@/lib/shipping";

export default function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCart();
  const subtotal = total();
  const shipping = calculateShipping(subtotal, "GB");

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold uppercase mb-4">Your Basket</h1>
        <p className="text-stone-500 mb-6">Your basket is empty.</p>
        <Link href="/britpart" className="rounded-lg bg-amber-600 px-6 py-3 text-white font-medium hover:bg-amber-700">
          Browse Parts
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold uppercase mb-6">Your Basket</h1>
      <ul className="divide-y rounded-lg border bg-white">
        {items.map((item) => (
          <li key={item.partNumber} className="flex gap-4 p-4">
            <div className="relative h-20 w-20 shrink-0 rounded border bg-stone-50">
              <Image
                src={item.imageUrl || "/placeholder-part.svg"}
                alt={item.title}
                fill
                className="object-contain p-1"
                unoptimized
              />
            </div>
            <div className="flex-1">
              <p className="font-mono text-sm font-bold text-amber-800">{item.partNumber}</p>
              <p className="text-sm capitalize">{item.title}</p>
              <p className="font-semibold mt-1">{formatPrice(item.price)}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateQuantity(item.partNumber, parseInt(e.target.value) || 0)}
                className="w-16 rounded border px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={() => removeItem(item.partNumber)}
                className="text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 rounded-lg border bg-stone-50 p-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm mb-2 text-stone-500">
          <span>Est. shipping (UK)</span>
          <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
        </div>
        {subtotal < 75 && (
          <p className="text-xs text-amber-700 mb-4">Free UK delivery on orders over £75</p>
        )}
        <div className="flex justify-between font-bold text-lg border-t pt-4">
          <span>Total</span>
          <span>{formatPrice(subtotal + shipping)}</span>
        </div>
        <Link
          href="/checkout"
          className="mt-4 block w-full rounded-lg bg-amber-600 py-3 text-center font-semibold text-white hover:bg-amber-700"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
