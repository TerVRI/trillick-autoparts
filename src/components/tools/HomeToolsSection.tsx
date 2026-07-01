"use client";

import Link from "next/link";
import { Wrench } from "lucide-react";
import { featuredTools } from "@/lib/tools-registry";
import { ToolCard } from "@/components/tools/ToolCard";

export function HomeToolsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-amber-700">
            <Wrench className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wide">Free Planning Tools</span>
          </div>
          <h2 className="font-display text-2xl font-bold uppercase mt-1">Adventure Tools</h2>
          <p className="mt-1 text-stone-600">Off-road calculators, camping planners, diagnostics, and build wizards.</p>
        </div>
        <Link href="/tools" className="hidden sm:inline-block text-amber-700 font-medium hover:underline">
          All tools →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {featuredTools().slice(0, 8).map((tool) => (
          <ToolCard key={tool.slug} href={tool.href} title={tool.title} description={tool.description} icon={tool.icon} featured />
        ))}
      </div>
      <div className="mt-6 text-center sm:hidden">
        <Link href="/tools" className="text-amber-700 font-medium hover:underline">
          View all tools →
        </Link>
      </div>
    </section>
  );
}
