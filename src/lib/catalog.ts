import * as fs from "fs";
import * as path from "path";
import type { Category, Product } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const JSON_PATH = path.join(DATA_DIR, "products.json");

let cache: Product[] | null = null;

function jsonToProduct(p: Record<string, unknown>): Product {
  return {
    partNumber: p.partNumber as string,
    slug: p.slug as string,
    title: p.title as string,
    description: (p.description as string) || "",
    categorySlug: p.categorySlug as string,
    categoryName: p.categoryName as string,
    subcategorySlug: (p.subcategorySlug as string) || null,
    cataloguePage: (p.cataloguePage as number) || null,
    vehicles: (p.vehicles as string[]) || [],
    fitmentText: (p.fitmentText as string) || "",
    price: (p.price as number) ?? null,
    imageUrl: (p.imageUrl as string) || null,
    sourceUrl: (p.sourceUrl as string) || null,
    onSite: Boolean(p.onSite),
    hasImage: Boolean(p.hasImage),
    hasPrice: Boolean(p.hasPrice),
    purchasable: Boolean(p.purchasable),
    stockStatus: p.stockStatus as Product["stockStatus"],
  };
}

function loadProducts(): Product[] {
  if (cache) return cache;
  if (!fs.existsSync(JSON_PATH)) {
    console.warn("products.json not found — run npm run ingest");
    return [];
  }
  const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf-8"));
  cache = (data.products as Record<string, unknown>[]).map(jsonToProduct);
  return cache;
}

export function getAllProducts(): Product[] {
  return loadProducts();
}

export function getProductByPartNumber(partNumber: string): Product | null {
  const q = partNumber.toUpperCase();
  return loadProducts().find((p) => p.partNumber.toUpperCase() === q) ?? null;
}

export function getProductsByCategory(categorySlug: string, limit = 500): Product[] {
  return loadProducts()
    .filter((p) => p.categorySlug === categorySlug)
    .slice(0, limit);
}

export function searchProducts(query: string, limit = 50): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const qu = q.toUpperCase();

  return loadProducts()
    .filter((p) => {
      const pn = p.partNumber.toUpperCase();
      return (
        pn.includes(qu) ||
        pn.startsWith(qu) ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.fitmentText.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const aExact = a.partNumber.toUpperCase() === qu ? 0 : a.partNumber.toUpperCase().startsWith(qu) ? 1 : 2;
      const bExact = b.partNumber.toUpperCase() === qu ? 0 : b.partNumber.toUpperCase().startsWith(qu) ? 1 : 2;
      return aExact - bExact;
    })
    .slice(0, limit);
}

export function getCategories(): Category[] {
  const counts: Record<string, Category> = {};
  for (const p of loadProducts()) {
    if (!counts[p.categorySlug]) {
      counts[p.categorySlug] = { slug: p.categorySlug, name: p.categoryName, count: 0 };
    }
    counts[p.categorySlug].count++;
  }
  return Object.values(counts).sort((a, b) => a.name.localeCompare(b.name));
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return loadProducts()
    .filter((p) => p.categorySlug === product.categorySlug && p.partNumber !== product.partNumber)
    .slice(0, limit);
}

export function filterByVehicle(products: Product[], vehicle: string): Product[] {
  if (!vehicle) return products;
  const v = vehicle.toLowerCase();
  return products.filter(
    (p) =>
      p.fitmentText.toLowerCase().includes(v) ||
      p.vehicles.some((veh) => veh.toLowerCase().includes(v)) ||
      p.description.toLowerCase().includes(v)
  );
}

export function getCatalogStats() {
  const products = loadProducts();
  return {
    total: products.length,
    onSite: products.filter((p) => p.onSite).length,
    purchasable: products.filter((p) => p.purchasable).length,
    categories: getCategories().length,
  };
}
