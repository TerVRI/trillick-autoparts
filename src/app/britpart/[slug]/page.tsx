import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductsByCategory, filterByVehicle } from "@/lib/catalog";
import { BRITPART_CATEGORIES } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { VehicleSelector } from "@/components/VehicleSelector";

export async function generateStaticParams() {
  return BRITPART_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = BRITPART_CATEGORIES.find((c) => c.slug === slug);
  return { title: cat?.name || "Parts" };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ vehicle?: string }>;
}) {
  const { slug } = await params;
  const { vehicle } = await searchParams;
  const cat = BRITPART_CATEGORIES.find((c) => c.slug === slug);
  if (!cat) notFound();

  let products = getProductsByCategory(slug, 500);
  if (vehicle) products = filterByVehicle(products, vehicle);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="text-sm text-stone-500 mb-4">
        <Link href="/" className="hover:text-amber-700">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/britpart" className="hover:text-amber-700">Britpart</Link>
        <span className="mx-2">›</span>
        <span className="capitalize">{cat.name}</span>
      </nav>
      <div className="grid gap-8 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <VehicleSelector />
          <div className="mt-4 rounded-lg border p-4">
            <h4 className="font-semibold text-sm mb-2">Categories</h4>
            <ul className="space-y-1 text-sm max-h-64 overflow-y-auto">
              {BRITPART_CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/britpart/${c.slug}`}
                    className={`block rounded px-2 py-1 capitalize hover:bg-amber-50 ${c.slug === slug ? "bg-amber-100 font-medium text-amber-900" : "text-stone-600"}`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <div className="lg:col-span-3">
          <h1 className="font-display text-2xl font-bold uppercase capitalize mb-1">{cat.name}</h1>
          <p className="text-stone-500 text-sm mb-6">{products.length} parts</p>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.partNumber} product={p} />
            ))}
          </div>
          {products.length === 0 && (
            <p className="text-stone-500 py-12 text-center">No parts found for this filter.</p>
          )}
        </div>
      </div>
    </div>
  );
}
