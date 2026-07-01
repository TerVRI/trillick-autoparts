"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { calculateShipping, SHIPPING_COUNTRIES } from "@/lib/shipping";

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [country, setCountry] = useState("GB");

  const subtotal = total();
  const shipping = calculateShipping(subtotal, country);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p>Your basket is empty.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);

    const shipping = {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      line1: fd.get("line1") as string,
      line2: (fd.get("line2") as string) || undefined,
      city: fd.get("city") as string,
      county: (fd.get("county") as string) || undefined,
      postcode: fd.get("postcode") as string,
      country: fd.get("country") as string,
      phone: (fd.get("phone") as string) || undefined,
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, shipping }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) {
        clear();
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold uppercase mb-6">Checkout</h1>
      <div className="mb-6 rounded-lg border p-4 bg-stone-50">
        <p className="font-semibold">{items.length} item(s)</p>
        <p>Subtotal: {formatPrice(subtotal)}</p>
        <p>Shipping: {shipping === 0 ? "FREE" : formatPrice(shipping)}</p>
        <p className="font-bold mt-2">Total: {formatPrice(subtotal + shipping)}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" required placeholder="Full name" className="w-full rounded border px-3 py-2" />
        <input name="email" required type="email" placeholder="Email" className="w-full rounded border px-3 py-2" />
        <input name="phone" placeholder="Phone" className="w-full rounded border px-3 py-2" />
        <input name="line1" required placeholder="Address line 1" className="w-full rounded border px-3 py-2" />
        <input name="line2" placeholder="Address line 2" className="w-full rounded border px-3 py-2" />
        <div className="grid grid-cols-2 gap-3">
          <input name="city" required placeholder="City" className="rounded border px-3 py-2" />
          <input name="county" placeholder="County" className="rounded border px-3 py-2" />
        </div>
        <input name="postcode" required placeholder="Postcode" className="w-full rounded border px-3 py-2" />
        <select
          name="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full rounded border px-3 py-2"
        >
          {SHIPPING_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-amber-600 py-3 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {loading ? "Redirecting to payment..." : "Pay with Stripe"}
        </button>
      </form>
    </div>
  );
}
