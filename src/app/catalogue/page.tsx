"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { BRITPART_CATEGORIES } from "@/lib/types";
import { StockBadge } from "@/components/StockBadge";
import { PageBanner } from "@/components/PageBanner";
import type { Product, StockStatus } from "@/lib/types";

export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/search?q=&limit=10000")
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (category) list = list.filter((p) => p.categorySlug === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.partNumber.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.fitmentText.toLowerCase().includes(q)
      );
    }
    return list.slice(0, 200);
  }, [products, query, category]);

  return (
    <div>
      <PageBanner
        title="Interactive Catalogue"
        subtitle="Search the full Britpart 2025/26 accessory catalogue."
        imageKey="catalogueBanner"
      />
      <div className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-stone-600 mb-6 max-w-2xl">
        Search the full Britpart 2025/26 accessory catalogue. You can also{" "}
        <a
          href="https://www.trillickautoparts.com/images/general/trillick_catalogue2526.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-700 hover:underline"
        >
          download the PDF catalogue
        </a>
        .
      </p>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="search"
          placeholder="Search part number, description, vehicle..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border px-4 py-2"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border px-4 py-2"
        >
          <option value="">All categories</option>
          {BRITPART_CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-stone-500">Loading catalogue...</p>
      ) : (
        <>
          <p className="text-sm text-stone-500 mb-4">
            Showing {filtered.length} of {products.length} parts
          </p>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-stone-100 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Part No.</th>
                  <th className="px-4 py-3 font-semibold">Description</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Fitment</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.partNumber} className="border-t hover:bg-amber-50/50">
                    <td className="px-4 py-2 font-mono font-semibold text-amber-800">{p.partNumber}</td>
                    <td className="px-4 py-2 capitalize max-w-xs truncate">{p.title}</td>
                    <td className="px-4 py-2 capitalize text-stone-500">{p.categoryName}</td>
                    <td className="px-4 py-2 text-stone-500 max-w-xs truncate">{p.fitmentText || "—"}</td>
                    <td className="px-4 py-2">
                      <StockBadge status={p.stockStatus as StockStatus} />
                    </td>
                    <td className="px-4 py-2">
                      <Link href={`/product/${p.partNumber}`} className="text-amber-700 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
