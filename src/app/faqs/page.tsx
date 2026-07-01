import { StaticPage } from "@/components/StaticPage";

export const metadata = { title: "FAQs" };

export default function FaqsPage() {
  return (
    <StaticPage title="FAQs">
      <h2 className="text-lg font-semibold text-stone-900">Do you deliver to the UK and Ireland?</h2>
      <p>Yes. We offer free delivery on UK &amp; NI orders over £75, and deliver across Ireland, EU and worldwide.</p>
      <h2 className="text-lg font-semibold text-stone-900 mt-6">Can I order parts not listed with a price?</h2>
      <p>Yes. Use the Request Quote button on any product page, or contact us via WhatsApp or phone.</p>
      <h2 className="text-lg font-semibold text-stone-900 mt-6">Are these genuine Britpart parts?</h2>
      <p>We supply Britpart branded parts and accessories with Britpart&apos;s 24-month guarantee on applicable items.</p>
      <h2 className="text-lg font-semibold text-stone-900 mt-6">EU customers — import duties?</h2>
      <p>Shipping from Northern Ireland — no import duties shall apply under the NI Protocol for EU customers.</p>
    </StaticPage>
  );
}
