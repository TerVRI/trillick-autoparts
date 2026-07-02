import { StaticPage } from "@/components/StaticPage";
import { getPageContent } from "@/lib/site-content";

export const metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  const page = getPageContent("terms");
  if (!page) return null;

  return <StaticPage title={page.title} html={page.html} />;
}
