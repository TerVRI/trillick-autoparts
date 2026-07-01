"use client";

import Link from "next/link";
import { TOOL_CATEGORIES, TOOLS, toolsByCategory } from "@/lib/tools-registry";
import { ToolCard } from "@/components/tools/ToolCard";

export function ToolsHubContent() {
  return (
    <>
      {TOOL_CATEGORIES.map((cat) => {
        const tools = toolsByCategory(cat.id);
        if (!tools.length) return null;
        return (
          <section key={cat.id} className="mb-12">
            <h2 className="font-display text-xl font-bold uppercase text-stone-800">{cat.label}</h2>
            <p className="mt-1 mb-4 text-sm text-stone-500">{cat.description}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <ToolCard
                  key={tool.slug}
                  href={tool.href}
                  title={tool.title}
                  description={tool.description}
                  icon={tool.icon}
                  featured={tool.featured}
                />
              ))}
            </div>
          </section>
        );
      })}

      <section className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-center">
        <p className="text-stone-600">
          {TOOLS.length} tools available · Results link to our Britpart catalogue and quote system
        </p>
      </section>
    </>
  );
}
