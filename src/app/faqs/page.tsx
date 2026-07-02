import { StaticPage } from "@/components/StaticPage";
import { FaqAccordion } from "@/components/FaqAccordion";
import { getPageContent, parseFaqs } from "@/lib/site-content";

export const metadata = { title: "FAQs" };

export default function FaqsPage() {
  const page = getPageContent("faqs");
  if (!page) return null;

  const faqs = parseFaqs(page.html);

  return (
    <StaticPage title={page.title}>
      <FaqAccordion items={faqs} />
    </StaticPage>
  );
}
