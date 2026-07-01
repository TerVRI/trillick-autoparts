import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductByPartNumber, getRelatedProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { ProductActions } from "@/components/ProductActions";
import { StockBadge } from "@/components/StockBadge";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ partNumber: string }>;
}): Promise<Metadata> {
  const { partNumber } = await params;
  const product = getProductByPartNumber(partNumber);
  if (!product) return { title: "Part Not Found" };
  return {
    title: `${product.partNumber} - ${product.title}`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ partNumber: string }>;
}) {
  const { partNumber } = await params;
  const product = getProductByPartNumber(partNumber);
  if (!product) notFound();

  const related = getRelatedProducts(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.partNumber} - ${product.title}`,
    sku: product.partNumber,
    description: product.description,
    image: product.imageUrl,
    brand: { "@type": "Brand", name: "Britpart" },
    ...(product.price
      ? {
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "GBP",
            availability:
              product.stockStatus === "in_stock"
                ? "https://schema.org/InStock"
                : "https://schema.org/PreOrder",
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="text-sm text-stone-500 mb-6">
        <Link href="/" className="hover:text-amber-700">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/britpart" className="hover:text-amber-700">Britpart</Link>
        <span className="mx-2">›</span>
        <Link href={`/britpart/${product.categorySlug}`} className="hover:text-amber-700 capitalize">
          {product.categoryName}
        </Link>
        <span className="mx-2">›</span>
        <span>{product.partNumber}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-square rounded-lg border bg-stone-50">
          <Image
            src={product.imageUrl || "/placeholder-part.svg"}
            alt={product.title}
            fill
            className="object-contain p-4"
            priority
            unoptimized
          />
        </div>
        <div>
          <p className="font-mono text-lg font-bold text-amber-800">{product.partNumber}</p>
          <h1 className="font-display text-2xl font-bold uppercase mt-1 capitalize">{product.title}</h1>
          <div className="mt-3 flex items-center gap-3">
            <StockBadge status={product.stockStatus} />
            {product.price && (
              <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
            )}
          </div>
          {product.fitmentText && (
            <p className="mt-4 text-sm">
              <span className="font-semibold">Fits: </span>
              {product.fitmentText}
            </p>
          )}
          {product.description && (
            <p className="mt-4 text-stone-600 text-sm leading-relaxed">{product.description}</p>
          )}
          {product.cataloguePage && (
            <p className="mt-2 text-xs text-stone-400">
              Catalogue reference: page {product.cataloguePage}
            </p>
          )}
          <div className="mt-8">
            <ProductActions product={product} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-xl font-bold uppercase mb-4">Related Parts</h2>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.partNumber} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
