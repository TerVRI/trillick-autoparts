"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/site-content";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left font-medium text-stone-900 hover:bg-amber-50/50"
            >
              <span>{item.question}</span>
              <span className="shrink-0 text-amber-700">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <div className="border-t border-stone-100 px-5 pb-4 pt-2 text-stone-600">{item.answer}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
