"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface Suggestion {
  partNumber: string;
  title: string;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`);
      const data = await res.json();
      setSuggestions(data.results || []);
      setOpen(true);
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  }

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <form onSubmit={submit} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search part number or description..."
          className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </form>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-lg border border-stone-200 bg-white shadow-lg">
          {suggestions.map((s) => (
            <li key={s.partNumber}>
              <button
                type="button"
                className="flex w-full flex-col px-4 py-2 text-left hover:bg-amber-50"
                onClick={() => {
                  router.push(`/product/${s.partNumber}`);
                  setOpen(false);
                  setQuery("");
                }}
              >
                <span className="font-mono text-sm font-semibold text-amber-800">{s.partNumber}</span>
                <span className="text-xs text-stone-600 truncate">{s.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
