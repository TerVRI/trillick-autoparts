import type { Metadata } from "next";
import { StaticPage } from "@/components/StaticPage";
import { getPageContent } from "@/lib/site-content";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  const page = getPageContent("about");
  if (!page) return null;

  return <StaticPage title={page.title} html={page.html} />;
}
