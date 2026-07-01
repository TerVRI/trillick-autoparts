import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { ToolRecommendation } from "@/lib/tool-recommendations";

export function CategoryLinks({ recommendations }: { recommendations: ToolRecommendation[] }) {
  if (!recommendations.length) return null;
  return (
    <section className="rounded-xl border border-gray-200 bg-gray-50 p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Related Parts & Categories</h2>
      <div className="flex flex-wrap gap-2">
        {recommendations.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-medium text-green-800 transition hover:bg-green-50"
          >
            {r.label}
            <ExternalLink className="h-3 w-3" />
          </Link>
        ))}
      </div>
    </section>
  );
}
