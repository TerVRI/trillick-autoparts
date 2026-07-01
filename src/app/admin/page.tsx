"use client";

import { useState } from "react";

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [data, setData] = useState<{ orders: unknown[]; quotes: unknown[] } | null>(null);
  const [error, setError] = useState("");

  async function load(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch(`/api/admin?key=${encodeURIComponent(key)}`);
    if (!res.ok) {
      setError("Invalid password");
      return;
    }
    setData(await res.json());
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold uppercase mb-6">Admin</h1>
      {!data ? (
        <form onSubmit={load} className="flex gap-2 max-w-sm">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Admin password"
            className="flex-1 rounded border px-3 py-2"
          />
          <button type="submit" className="rounded bg-stone-900 px-4 py-2 text-white text-sm">
            Login
          </button>
        </form>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="font-semibold text-lg mb-3">Orders ({data.orders.length})</h2>
            <pre className="overflow-auto rounded border bg-stone-50 p-4 text-xs max-h-96">
              {JSON.stringify(data.orders, null, 2)}
            </pre>
          </section>
          <section>
            <h2 className="font-semibold text-lg mb-3">Quote Requests ({data.quotes.length})</h2>
            <pre className="overflow-auto rounded border bg-stone-50 p-4 text-xs max-h-96">
              {JSON.stringify(data.quotes, null, 2)}
            </pre>
          </section>
        </div>
      )}
      {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
    </div>
  );
}
