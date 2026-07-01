import { StaticPage } from "@/components/StaticPage";

export const metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <StaticPage title="Terms & Conditions">
      <p>
        By placing an order with Trillick Auto Parts Centre you agree to these terms. All prices
        are in GBP. We reserve the right to correct pricing errors. Title to goods passes on
        receipt of full payment.
      </p>
      <p>
        Product images are for illustration. Fitment information should be verified before
        ordering — contact us if unsure.
      </p>
    </StaticPage>
  );
}
