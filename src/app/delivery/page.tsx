import { StaticPage } from "@/components/StaticPage";

export const metadata = { title: "Delivery" };

export default function DeliveryPage() {
  return (
    <StaticPage title="Delivery">
      <ul className="space-y-2 list-disc pl-5">
        <li><strong>UK &amp; Northern Ireland:</strong> Free delivery on orders over £75. Standard rate £6.95 below threshold.</li>
        <li><strong>Ireland:</strong> Free delivery on orders over £75. Standard rate £9.95.</li>
        <li><strong>EU:</strong> From £14.95</li>
        <li><strong>Worldwide:</strong> From £24.95</li>
      </ul>
      <p className="mt-4">Next day delivery available in UK &amp; Ireland on in-stock items (subject to cut-off times).</p>
    </StaticPage>
  );
}
