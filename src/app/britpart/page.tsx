import Link from "next/link";
import { getCategories } from "@/lib/catalog";
import { BRITPART_CATEGORIES } from "@/lib/types";
import { PageBanner } from "@/components/PageBanner";

export const metadata = { title: "Britpart Parts & Accessories" };

export default function BritpartIndexPage() {
  const categories = getCategories();
  const countMap = Object.fromEntries(categories.map((c) => [c.slug, c.count]));

  return (
    <div>
      <PageBanner
        title="Britpart Parts & Accessories"
        subtitle="Browse our complete Britpart accessory catalogue. Select a category to find parts for your Land Rover."
        imageKey="shopBanner"
      />
      <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="text-sm text-stone-500 mb-4">
        <Link href="/" className="hover:text-amber-700">Home</Link>
        <span className="mx-2">›</span>
        <span>Britpart Parts &amp; Accessories</span>
      </nav>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BRITPART_CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/britpart/${cat.slug}`}
            className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-5 hover:border-amber-400 hover:shadow-sm transition capitalize"
          >
            <span className="font-medium">{cat.name}</span>
            <span className="text-sm text-stone-400">
              {(countMap[cat.slug] || 0).toLocaleString()}
            </span>
          </Link>
        ))}
      </div>
      </div>
    </div>
  );
}
