import * as fs from "fs";
import * as path from "path";

const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");

interface CataloguePart {
  partNumber: string;
  title: string;
  description: string;
  categorySlug: string;
  categoryName: string;
  cataloguePage: number;
  vehicles: string[];
  fitmentText: string;
}

interface ScrapedProduct {
  partNumber: string;
  title: string;
  description: string;
  price: number | null;
  imageUrl: string | null;
  url: string;
  categoryPath: string[];
}

export interface MergedProduct {
  partNumber: string;
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  categoryName: string;
  subcategorySlug: string | null;
  cataloguePage: number | null;
  vehicles: string[];
  fitmentText: string;
  price: number | null;
  imageUrl: string | null;
  sourceUrl: string | null;
  onSite: boolean;
  hasImage: boolean;
  hasPrice: boolean;
  purchasable: boolean;
  stockStatus: "in_stock" | "available_to_order" | "quote_required";
}

const IMAGE_BASE =
  "https://trillickautoparts.blob.core.windows.net/britpart-images/Content/Images/Accessory";
const PLACEHOLDER =
  "https://www.trillickautoparts.com/images/general/awaiting_image_LRG.jpg";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function defaultImage(partNumber: string): string {
  return `${IMAGE_BASE}/${partNumber}_700x525.jpg`;
}

function main() {
  const extractPath = path.join(DATA_DIR, "catalogue-extract.json");
  const scrapedPath = path.join(DATA_DIR, "scraped.json");

  if (!fs.existsSync(extractPath)) {
    console.error("Run extract-catalogue.py first");
    process.exit(1);
  }

  const extract = JSON.parse(fs.readFileSync(extractPath, "utf-8")) as {
    parts: CataloguePart[];
  };

  let scrapedMap = new Map<string, ScrapedProduct>();
  if (fs.existsSync(scrapedPath)) {
    const scraped = JSON.parse(fs.readFileSync(scrapedPath, "utf-8")) as {
      products: ScrapedProduct[];
    };
    scrapedMap = new Map(scraped.products.map((p) => [p.partNumber, p]));
  }

  const merged: MergedProduct[] = extract.parts.map((cat) => {
    const scraped = scrapedMap.get(cat.partNumber);
    const title = scraped?.title || cat.title || cat.partNumber;
    const description = scraped?.description || cat.description || title;
    const price = scraped?.price ?? null;
    const imageUrl = scraped?.imageUrl || defaultImage(cat.partNumber);
    const onSite = !!scraped;
    const hasPrice = price !== null && price > 0;
    const purchasable = hasPrice;
    const stockStatus: MergedProduct["stockStatus"] = hasPrice
      ? "in_stock"
      : onSite
        ? "available_to_order"
        : "quote_required";

    return {
      partNumber: cat.partNumber,
      slug: slugify(cat.partNumber),
      title,
      description,
      categorySlug: cat.categorySlug,
      categoryName: cat.categoryName,
      subcategorySlug: null,
      cataloguePage: cat.cataloguePage,
      vehicles: cat.vehicles || [],
      fitmentText: cat.fitmentText || "",
      price,
      imageUrl,
      sourceUrl: scraped?.url || null,
      onSite,
      hasImage: !!scraped?.imageUrl,
      hasPrice,
      purchasable,
      stockStatus,
    };
  });

  // Add scraped-only products not in catalogue
  for (const [partNumber, scraped] of scrapedMap) {
    if (!merged.find((m) => m.partNumber === partNumber)) {
      merged.push({
        partNumber,
        slug: slugify(partNumber),
        title: scraped.title,
        description: scraped.description,
        categorySlug: "miscellaneous",
        categoryName: "Miscellaneous",
        subcategorySlug: null,
        cataloguePage: null,
        vehicles: [],
        fitmentText: "",
        price: scraped.price,
        imageUrl: scraped.imageUrl || defaultImage(partNumber),
        sourceUrl: scraped.url,
        onSite: true,
        hasImage: !!scraped.imageUrl,
        hasPrice: scraped.price !== null && scraped.price > 0,
        purchasable: scraped.price !== null && scraped.price > 0,
        stockStatus:
          scraped.price && scraped.price > 0 ? "in_stock" : "available_to_order",
      });
    }
  }

  merged.sort((a, b) => a.partNumber.localeCompare(b.partNumber));

  const output = {
    mergedAt: new Date().toISOString(),
    count: merged.length,
    stats: {
      onSite: merged.filter((p) => p.onSite).length,
      hasPrice: merged.filter((p) => p.hasPrice).length,
      purchasable: merged.filter((p) => p.purchasable).length,
      quoteRequired: merged.filter((p) => p.stockStatus === "quote_required").length,
    },
    products: merged,
  };

  const outPath = path.join(DATA_DIR, "products.json");
  fs.writeFileSync(outPath, JSON.stringify(output));

  // Also write categories index
  const categories: Record<
    string,
    { name: string; slug: string; count: number }
  > = {};
  for (const p of merged) {
    if (!categories[p.categorySlug]) {
      categories[p.categorySlug] = {
        name: p.categoryName,
        slug: p.categorySlug,
        count: 0,
      };
    }
    categories[p.categorySlug].count++;
  }

  fs.writeFileSync(
    path.join(DATA_DIR, "categories.json"),
    JSON.stringify(Object.values(categories).sort((a, b) => a.name.localeCompare(b.name)), null, 2)
  );

  console.log(`Merged ${merged.length} products -> ${outPath}`);
  console.log("Stats:", output.stats);
}

main();
