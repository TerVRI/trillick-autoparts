import { StaticPage } from "@/components/StaticPage";
import { getPageContent } from "@/lib/site-content";

export const metadata = { title: "Delivery" };

export default function DeliveryPage() {
  const page = getPageContent("delivery");
  if (!page) return null;

  return <StaticPage title={page.title} html={page.html} />;
}
