"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { WhatsAppButton } from "./WhatsAppButton";

export function ProductActions({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [quoteSent, setQuoteSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function requestQuote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        partNumbers: [product.partNumber],
        customerName: fd.get("name"),
        customerEmail: fd.get("email"),
        customerPhone: fd.get("phone"),
        message: fd.get("message"),
      }),
    });
    setQuoteSent(true);
    setLoading(false);
  }

  if (product.purchasable && product.price) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Qty</label>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value) || 1)}
            className="w-20 rounded border px-2 py-1"
          />
        </div>
        <button
          type="button"
          onClick={() =>
            addItem(
              {
                partNumber: product.partNumber,
                title: product.title,
                price: product.price!,
                imageUrl: product.imageUrl,
              },
              qty
            )
          }
          className="w-full rounded-lg bg-amber-600 py-3 font-semibold text-white hover:bg-amber-700"
        >
          Add to Basket — {formatPrice(product.price * qty)}
        </button>
      </div>
    );
  }

  if (quoteSent) {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
        Quote request sent! We&apos;ll be in touch shortly.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-600">
        This part is available to order. Request a quote or contact us directly.
      </p>
      <WhatsAppButton
        message={`Hi, I'd like a quote for part ${product.partNumber} - ${product.title}`}
      />
      <form onSubmit={requestQuote} className="space-y-3 rounded-lg border p-4">
        <h4 className="font-semibold">Request Quote</h4>
        <input name="name" required placeholder="Your name" className="w-full rounded border px-3 py-2 text-sm" />
        <input name="email" required type="email" placeholder="Email" className="w-full rounded border px-3 py-2 text-sm" />
        <input name="phone" placeholder="Phone" className="w-full rounded border px-3 py-2 text-sm" />
        <textarea name="message" placeholder="Message (optional)" rows={2} className="w-full rounded border px-3 py-2 text-sm" />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-stone-900 py-2 text-sm text-white hover:bg-stone-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Quote Request"}
        </button>
      </form>
    </div>
  );
}
