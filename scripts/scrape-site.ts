import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const BASE = "https://www.trillickautoparts.com";
const SITEMAP_URL = `${BASE}/xmlsitemap.asp`;
const CONCURRENCY = 8;
const DELAY_MS = 100;

interface ScrapedProduct {
  partNumber: string;
  title: string;
  description: string;
  price: number | null;
  imageUrl: string | null;
  url: string;
  categoryPath: string[];
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "TrillickCatalogBot/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function extractPartFromUrl(url: string): string | null {
  const decoded = decodeURIComponent(url);
  const m = decoded.match(/\/item\/[^/]+\/[^/]+\/([A-Z0-9]+)\/\d+/i);
  if (m) return m[1].toUpperCase();
  const m2 = decoded.match(/\/([A-Z]{2,4}\d{3,7}[A-Z]{0,4})\/\d+$/i);
  return m2 ? m2[1].toUpperCase() : null;
}

function parseProductPage(html: string, url: string): ScrapedProduct | null {
  const $ = cheerio.load(html);
  const partFromUrl = extractPartFromUrl(url);
  const h2 = $("h2").first().text().trim();
  let partNumber = partFromUrl || "";
  let title = h2;

  if (h2.includes(" - ")) {
    const [code, ...rest] = h2.split(" - ");
    if (/^[A-Z0-9]{4,12}$/i.test(code.trim())) {
      partNumber = code.trim().toUpperCase();
      title = rest.join(" - ").trim();
    }
  }

  if (!partNumber) return null;

  const desc =
    $('meta[name="description"]').attr("content")?.trim() ||
    $(".product_description, .description").first().text().trim() ||
    "";

  let price: number | null = null;
  const priceText = $("#price, .price, .product_price").first().text();
  const priceMatch = priceText.match(/[\d,.]+/);
  if (priceMatch) {
    price = parseFloat(priceMatch[0].replace(",", ""));
  }

  const img =
    $("img.big_lightbox_img").attr("src") ||
    $('img[src*="britpart-images"]').first().attr("src") ||
    null;

  const breadcrumbs: string[] = [];
  $(".breadcrumbsAcc a, .breadcrumbs a").each((_, el) => {
    const t = $(el).text().trim();
    if (t && t !== "Home") breadcrumbs.push(t);
  });

  return {
    partNumber,
    title: title || partNumber,
    description: desc,
    price,
    imageUrl: img,
    url,
    categoryPath: breadcrumbs,
  };
}

async function scrapeUrls(urls: string[]): Promise<ScrapedProduct[]> {
  const results: ScrapedProduct[] = [];
  const itemUrls = urls.filter((u) => u.includes("/item/"));

  for (let i = 0; i < itemUrls.length; i += CONCURRENCY) {
    const batch = itemUrls.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async (url) => {
        try {
          await sleep(DELAY_MS);
          const html = await fetchText(url);
          return parseProductPage(html, url);
        } catch {
          return null;
        }
      })
    );
    for (const r of batchResults) {
      if (r) results.push(r);
    }
    if (i % 200 === 0) {
      console.log(`Scraped ${Math.min(i + CONCURRENCY, itemUrls.length)}/${itemUrls.length}`);
    }
  }
  return results;
}

async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  console.log("Fetching sitemap...");
  const sitemap = await fetchText(SITEMAP_URL);
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const itemUrls = urls.filter((u) => u.includes("/item/"));
  console.log(`Found ${itemUrls.length} product URLs`);

  // Scrape subset for speed in dev; use SCRAPE_ALL=1 for full scrape
  const scrapeAll = process.env.SCRAPE_ALL === "1";
  const toScrape = scrapeAll ? itemUrls : itemUrls.slice(0, 500);
  console.log(`Scraping ${toScrape.length} pages${scrapeAll ? "" : " (set SCRAPE_ALL=1 for full)"}`);

  const products = await scrapeUrls(toScrape);

  const byPart: Record<string, ScrapedProduct> = {};
  for (const p of products) {
    if (!byPart[p.partNumber] || (p.price && !byPart[p.partNumber].price)) {
      byPart[p.partNumber] = p;
    }
  }

  const output = {
    scrapedAt: new Date().toISOString(),
    count: Object.keys(byPart).length,
    products: Object.values(byPart),
  };

  const outPath = path.join(DATA_DIR, "scraped.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Saved ${output.count} scraped products -> ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
