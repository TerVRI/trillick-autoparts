import siteContentData from "../../data/site-content.json";
import blogPostsData from "../../data/blog-posts.json";

export interface SitePageContent {
  title: string;
  html: string;
  images: string[];
}

export interface SiteLocation {
  address: string;
  phone: string;
  phoneIntl: string;
  email: string;
  lat: number;
  lng: number;
}

export interface SiteContent {
  scrapedAt: string;
  location: SiteLocation;
  pages: Record<string, SitePageContent>;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  html: string;
  featuredImage: string | null;
  images: string[];
  sourceUrl: string;
}

const content = siteContentData as SiteContent;
const blog = blogPostsData as { scrapedAt: string; posts: BlogPost[] };

export function getSiteContent(): SiteContent {
  return content;
}

export function getPageContent(slug: string): SitePageContent | undefined {
  return content.pages[slug];
}

export function getLocation(): SiteLocation {
  return content.location;
}

export function getBlogPosts(): BlogPost[] {
  return blog.posts;
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return blog.posts.find((p) => p.slug === slug);
}

export function getBlogSlugs(): string[] {
  return blog.posts.map((p) => p.slug);
}

/** Rewrite legacy site links in migrated HTML to new routes. */
export function normalizeContentHtml(html: string): string {
  return html
    .replace(/https:\/\/www\.trillickautoparts\.com\/contact-us/g, "/contact")
    .replace(/https:\/\/www\.trillickautoparts\.com\/about-us/g, "/about")
    .replace(/https:\/\/www\.trillickautoparts\.com\/returns-policy/g, "/returns")
    .replace(/https:\/\/www\.trillickautoparts\.com\/returns%2Dpolicy/g, "/returns")
    .replace(/https:\/\/www\.trillickautoparts\.com\/terms-and-conditions/g, "/terms")
    .replace(/https:\/\/www\.trillickautoparts\.com\/terms%2Dand%2Dconditions/g, "/terms")
    .replace(/https:\/\/www\.trillickautoparts\.com\/delivery/g, "/delivery")
    .replace(/https:\/\/www\.trillickautoparts\.com\/location/g, "/location")
    .replace(/https:\/\/www\.trillickautoparts\.com\/faqs/g, "/faqs")
    .replace(/https:\/\/www\.trillickautoparts\.com\/blog/g, "/blog")
    .replace(/<a href="javascript:[^"]*">Back<\/a>/gi, "")
    .replace(/data-rel="[^"]*"/gi, "");
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function parseFaqs(html: string): FaqItem[] {
  const items: FaqItem[] = [];
  const re = /<div><a>(.*?)<\/a><\/div>\s*<div><p>([\s\S]*?)<\/p>\s*<\/div>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    items.push({
      question: m[1].replace(/&#39;/g, "'").trim(),
      answer: m[2].replace(/&#39;/g, "'").trim(),
    });
  }
  return items;
}
