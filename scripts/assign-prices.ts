/**
 * Assign placeholder prices to on-site products for checkout demo.
 * Replace with real price import from Trillick ERP when available.
 */
import * as fs from "fs";
import * as path from "path";

const productsPath = path.join(__dirname, "../data/products.json");
const data = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

let updated = 0;
for (const p of data.products) {
  if (p.onSite && !p.price) {
    // Deterministic price from part number hash for demo
    const hash = p.partNumber.split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
    p.price = Math.round((19.99 + (hash % 180)) * 100) / 100;
    p.hasPrice = true;
    p.purchasable = true;
    p.stockStatus = "in_stock";
    updated++;
  }
}

data.stats = {
  onSite: data.products.filter((p: { onSite: boolean }) => p.onSite).length,
  hasPrice: data.products.filter((p: { hasPrice: boolean }) => p.hasPrice).length,
  purchasable: data.products.filter((p: { purchasable: boolean }) => p.purchasable).length,
  quoteRequired: data.products.filter((p: { stockStatus: string }) => p.stockStatus === "quote_required").length,
};

fs.writeFileSync(productsPath, JSON.stringify(data));
console.log(`Assigned demo prices to ${updated} on-site products`);
