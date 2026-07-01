# Trillick Auto Parts — Production Site

Modern replacement for [trillickautoparts.com](https://www.trillickautoparts.com/) with the full Britpart 2025/26 accessory catalogue (~6,300 parts), search, vehicle garage, quote requests, and Stripe checkout.

## Quick start

```bash
npm install
npm run ingest    # Extract PDF + scrape site + merge (first time, ~10 min)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data pipeline

| Command | Description |
|---------|-------------|
| `npm run extract` | Parse catalogue PDF → `data/catalogue-extract.json` |
| `npm run scrape` | Scrape existing site products → `data/scraped.json` |
| `npm run merge` | Merge into `data/products.json` |
| `npm run assign-prices` | Assign demo prices to on-site parts |
| `npm run seed` | Verify catalog ready |

Set `SCRAPE_ALL=1 npm run scrape` for full 7,600 URL scrape.

## Environment

Copy `.env.example` to `.env.local` and configure Stripe, admin password, and site URL.

## Deploy (Vercel)

1. Push repo to GitHub
2. Import in Vercel — ensure `data/products.json` is committed
3. Add environment variables
4. Point domain DNS to Vercel
