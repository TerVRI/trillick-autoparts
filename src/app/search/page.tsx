"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}&limit=100`)
      .then((r) => r.json())
      .then((d) => {
        setResults(d.results || []);
        setLoading(false);
      });
  }, [q]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold uppercase mb-2">Search Results</h1>
      <p className="text-stone-500 mb-6">
        {loading ? "Searching..." : `${results.length} results for "${q}"`}
      </p>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {results.map((p) => (
          <ProductCard key={p.partNumber} product={p as Product} />
        ))}
      </div>
      {!loading && results.length === 0 && q && (
        <p className="text-center text-stone-500 py-12">
          No parts found. Try a part number like DA2054 or contact us for help.
        </p>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
