import { StaticPage } from "@/components/StaticPage";
import { getPageContent } from "@/lib/site-content";

export const metadata = { title: "Returns Policy" };

export default function ReturnsPage() {
  const page = getPageContent("returns");
  if (!page) return null;

  return <StaticPage title={page.title} html={page.html} />;
}
