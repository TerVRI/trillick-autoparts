"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { CategoryLinks } from "./CategoryLinks";
import { ToolQuoteForm } from "./ToolQuoteForm";
import type { ToolRecommendation } from "@/lib/tool-recommendations";

interface ToolLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  recommendations?: ToolRecommendation[];
  toolContext?: string;
  quoteSummary?: string;
  backHref?: string;
}

export function ToolLayout({
  title,
  description,
  children,
  recommendations = [],
  toolContext,
  quoteSummary,
  backHref = "/tools",
}: ToolLayoutProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href={backHref} className="mb-6 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-green-700">
        <ArrowLeft className="h-4 w-4" /> Back to Tools
      </Link>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-gray-600">{description}</p>
      </header>
      <div className="space-y-8">
        {children}
        {recommendations.length > 0 && <CategoryLinks recommendations={recommendations} />}
        {(toolContext || quoteSummary) && (
          <ToolQuoteForm toolContext={toolContext ?? title} summary={quoteSummary} />
        )}
      </div>
    </div>
  );
}
