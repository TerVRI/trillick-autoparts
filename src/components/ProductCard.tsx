import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { StockBadge } from "./StockBadge";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/product/${product.partNumber}`} className="relative aspect-[4/3] bg-stone-100">
        <Image
          src={product.imageUrl || "/placeholder-part.svg"}
          alt={product.title}
          fill
          className="object-contain p-2"
          sizes="(max-width:768px) 50vw, 25vw"
          unoptimized
        />
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <p className="font-mono text-sm font-bold text-amber-800">{product.partNumber}</p>
        <Link href={`/product/${product.partNumber}`}>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium text-stone-900 group-hover:text-amber-800 capitalize">
            {product.title}
          </h3>
        </Link>
        {product.fitmentText && (
          <p className="mt-1 line-clamp-1 text-xs text-stone-500">{product.fitmentText}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          <StockBadge status={product.stockStatus} />
          {product.price ? (
            <span className="font-semibold text-stone-900">{formatPrice(product.price)}</span>
          ) : (
            <span className="text-xs text-stone-500">POA</span>
          )}
        </div>
        <Link
          href={`/product/${product.partNumber}`}
          className="mt-2 block rounded bg-stone-900 py-2 text-center text-xs font-medium text-white hover:bg-amber-700"
        >
          More Info
        </Link>
      </div>
    </article>
  );
}
