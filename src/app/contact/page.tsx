import { StaticPage } from "@/components/StaticPage";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const metadata = { title: "Contact Us" };

export default function ContactPage() {
  return (
    <StaticPage title="Contact Us">
      <p>Get in touch for parts enquiries, quotes, and advice.</p>
      <ul className="space-y-2 not-prose">
        <li><strong>Tel:</strong> <a href="tel:02889561897" className="text-amber-700">028 8956 1897</a></li>
        <li><strong>Email:</strong> <a href="mailto:info@trillickautoparts.com" className="text-amber-700">info@trillickautoparts.com</a></li>
        <li><strong>Address:</strong> 53 Effernan Rd, Trillick, Omagh, BT78 3SG, Co. Tyrone, UK</li>
      </ul>
      <div className="not-prose mt-6">
        <WhatsAppButton message="Hello, I'd like to enquire about Land Rover parts." />
      </div>
    </StaticPage>
  );
}
