import { StaticPage } from "@/components/StaticPage";
import { ContentHtml } from "@/components/ContentHtml";
import { LocationMap } from "@/components/LocationMap";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getPageContent } from "@/lib/site-content";

export const metadata = { title: "Contact Us" };

export default function ContactPage() {
  const page = getPageContent("contact");
  if (!page) return null;

  return (
    <StaticPage title={page.title}>
      <ContentHtml html={page.html} />
      <div className="not-prose mt-8 space-y-8">
        <div>
          <h2 className="font-display text-xl font-bold uppercase text-stone-900">Find Us</h2>
          <LocationMap className="mt-4" height={360} zoom={16} />
        </div>
        <WhatsAppButton message="Hello, I'd like to enquire about Land Rover parts." />
      </div>
    </StaticPage>
  );
}
