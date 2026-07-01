import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

/** Copy products.json into public for client-side catalogue browser if needed */
function main() {
  const src = path.join(DATA_DIR, "products.json");
  if (!fs.existsSync(src)) {
    console.log("No products.json — run npm run ingest first");
    process.exit(0);
  }
  const stats = JSON.parse(fs.readFileSync(src, "utf-8")).stats;
  console.log("Catalog ready:", stats);
  console.log("Using JSON catalog at data/products.json");
}

main();
