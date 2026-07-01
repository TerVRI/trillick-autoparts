import { getAllProducts, getCategories } from "@/lib/catalog";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.trillickautoparts.com";
  const products = getAllProducts();
  const categories = getCategories();

  const staticPages = ["", "/britpart", "/catalogue", "/about", "/contact", "/location", "/faqs", "/delivery", "/returns", "/terms"].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })
  );

  const categoryPages = categories.map((c) => ({
    url: `${base}/britpart/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const productPages = products.slice(0, 5000).map((p) => ({
    url: `${base}/product/${p.partNumber}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
