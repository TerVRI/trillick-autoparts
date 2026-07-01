import { StaticPage } from "@/components/StaticPage";

export const metadata = { title: "Returns Policy" };

export default function ReturnsPage() {
  return (
    <StaticPage title="Returns Policy">
      <p>
        If you need to return an item, please contact us within 14 days of receipt. Items must
        be unused and in original packaging where applicable. Return shipping costs may apply
        unless the item is faulty or incorrectly supplied.
      </p>
      <p>Contact info@trillickautoparts.com or call 028 8956 1897 to arrange a return.</p>
    </StaticPage>
  );
}
