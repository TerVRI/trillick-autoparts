import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const PUBLIC_CONTENT = path.join(ROOT, "public", "content");
const BASE = "https://www.trillickautoparts.com";

interface SitePage {
  slug: string;
  title: string;
  html: string;
  images: string[];
}

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  html: string;
  featuredImage: string | null;
  images: string[];
  sourceUrl: string;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "TrillickContentBot/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function slugFromUrl(url: string): string {
  const u = new URL(url);
  return u.pathname.replace(/^\/+|\/+$/g, "") || "home";
}

function cleanHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\sclass="[^"]*"/gi, "")
    .replace(/\sstyle="[^"]*"/gi, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractCellContent($: cheerio.CheerioAPI): string {
  const cell = $(".cell_full_sub").first();
  if (!cell.length) return "";

  cell.find("form, script, style, .mapContainer, #map").remove();
  cell.find("aside.aside_date").remove();

  return cleanHtml(cell.html() || "");
}

function extractBlogBody($: cheerio.CheerioAPI): string {
  const section = $(".section_date_content").first();
  if (section.length) return cleanHtml(section.html() || "");
  return extractCellContent($);
}

function extractExcerpt(html: string, max = 220): string {
  const text = cheerio.load(html).text().replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

function collectImageUrls(html: string, $?: cheerio.CheerioAPI): string[] {
  const urls = new Set<string>();
  const re = /src="(https:\/\/www\.trillickautoparts\.com\/[^"]+)"/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const url = m[1];
    if (!url.includes("/images/general/") && !url.includes("404.jpg")) {
      urls.add(url);
    }
  }
  if ($) {
    $("img").each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("href") || "";
      if (src.startsWith("http") && !src.includes("/images/general/")) {
        urls.add(src.startsWith("http") ? src : `${BASE}${src}`);
      }
    });
  }
  return [...urls];
}

function localImagePath(url: string): string {
  const parsed = new URL(url);
  const name = decodeURIComponent(path.basename(parsed.pathname)).replace(/[^\w.-]+/g, "-");
  const hash = Buffer.from(url).toString("base64url").slice(0, 8);
  const ext = path.extname(name) || ".jpg";
  const base = path.basename(name, ext) || "image";
  return `/content/images/${base}-${hash}${ext}`;
}

async function downloadImage(url: string, destPath: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "TrillickContentBot/1.0" },
    });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, buf);
    return true;
  } catch {
    return false;
  }
}

function rewriteImages(html: string, urlMap: Map<string, string>): string {
  let out = html;
  for (const [remote, local] of urlMap) {
    out = out.split(remote).join(local);
    out = out.split(encodeURI(remote)).join(local);
  }
  return out;
}

async function scrapePage(url: string, slug: string): Promise<SitePage> {
  const html = await fetchText(url);
  const $ = cheerio.load(html);
  const title = $(".h1sub, h1").first().text().trim() || slug;
  const body = extractCellContent($);
  const images = collectImageUrls(body, $);
  return { slug, title, html: body, images };
}

async function scrapeBlogPost(url: string): Promise<BlogPost> {
  const html = await fetchText(url);
  const $ = cheerio.load(html);
  const title = $(".h1sub, h1").first().text().trim();
  const slug = slugFromUrl(url);
  const body = extractBlogBody($);
  const featured =
    $(".list_feat_img img, .section_date_content img, .cell_full_sub img")
      .first()
      .attr("src") || null;
  const featuredImage = featured
    ? featured.startsWith("http")
      ? featured
      : `${BASE}${featured}`
    : null;
  const images = collectImageUrls(body, $);
  if (featuredImage) images.unshift(featuredImage);

  return {
    slug,
    title,
    excerpt: extractExcerpt(body),
    html: body,
    featuredImage,
    images: [...new Set(images)],
    sourceUrl: url,
  };
}

function parseBlogIndex(html: string): { url: string; title: string; image: string | null; excerpt: string }[] {
  const $ = cheerio.load(html);
  const posts: { url: string; title: string; image: string | null; excerpt: string }[] = [];

  $(".list_date li").each((_, li) => {
    const link = $(li).find("a").first();
    const href = link.attr("href");
    if (!href || href.includes("/blog")) return;
    const url = href.startsWith("http") ? href : `${BASE}${href}`;
    const title = link.text().trim();
    const img = $(li).find("img").first().attr("src");
    const image = img ? (img.startsWith("http") ? img : `${BASE}${img}`) : null;
    const excerpt = extractExcerpt($(li).text());
    posts.push({ url, title, image, excerpt });
  });

  return posts;
}

async function processImages(
  pages: SitePage[],
  posts: BlogPost[]
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();
  const allUrls = new Set<string>();

  for (const page of pages) page.images.forEach((u) => allUrls.add(u));
  for (const post of posts) post.images.forEach((u) => allUrls.add(u));

  for (const url of allUrls) {
    const local = localImagePath(url);
    const dest = path.join(PUBLIC_CONTENT, local.replace(/^\/content\//, ""));
    const ok = await downloadImage(url, dest);
    if (ok) urlMap.set(url, local);
    await sleep(50);
  }

  return urlMap;
}

async function main() {
  console.log("Scraping site content from", BASE);

  const pageUrls: { slug: string; url: string }[] = [
    { slug: "about", url: `${BASE}/about-us` },
    { slug: "contact", url: `${BASE}/contact-us` },
    { slug: "location", url: `${BASE}/location` },
    { slug: "delivery", url: `${BASE}/delivery` },
    { slug: "faqs", url: `${BASE}/faqs` },
    { slug: "returns", url: `${BASE}/returns%2Dpolicy` },
    { slug: "terms", url: `${BASE}/terms%2Dand%2Dconditions` },
  ];

  const pages: SitePage[] = [];
  for (const { slug, url } of pageUrls) {
    console.log("Page:", slug);
    pages.push(await scrapePage(url, slug));
    await sleep(200);
  }

  console.log("Blog index...");
  const blogIndexHtml = await fetchText(`${BASE}/blog`);
  const blogLinks = parseBlogIndex(blogIndexHtml);

  const posts: BlogPost[] = [];
  for (const link of blogLinks) {
    console.log("Blog:", link.url);
    posts.push(await scrapeBlogPost(link.url));
    await sleep(200);
  }

  console.log("Downloading images...");
  const urlMap = await processImages(pages, posts);

  for (const page of pages) {
    page.html = rewriteImages(page.html, urlMap);
    page.images = page.images.map((u) => urlMap.get(u) || u);
  }
  for (const post of posts) {
    post.html = rewriteImages(post.html, urlMap);
    post.featuredImage = post.featuredImage ? urlMap.get(post.featuredImage) || post.featuredImage : null;
    post.images = post.images.map((u) => urlMap.get(u) || u);
  }

  const siteContent = {
    scrapedAt: new Date().toISOString(),
    location: {
      address: "53 Effernan Rd, Trillick, Omagh, BT78 3SG, Co. Tyrone, UK",
      phone: "028 8956 1897",
      phoneIntl: "+44 28 8956 1897",
      email: "info@trillickautoparts.com",
      lat: 54.435463,
      lng: -7.498104,
    },
    pages: Object.fromEntries(pages.map((p) => [p.slug, { title: p.title, html: p.html, images: p.images }])),
  };

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, "site-content.json"), JSON.stringify(siteContent, null, 2));
  fs.writeFileSync(
    path.join(DATA_DIR, "blog-posts.json"),
    JSON.stringify({ scrapedAt: new Date().toISOString(), posts }, null, 2)
  );

  console.log(`Done: ${pages.length} pages, ${posts.length} blog posts, ${urlMap.size} images`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
