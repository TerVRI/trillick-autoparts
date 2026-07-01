import { StaticPage } from "@/components/StaticPage";

export const metadata = { title: "Location" };

export default function LocationPage() {
  return (
    <StaticPage title="Location">
      <p><strong>Trillick Auto Parts Centre</strong></p>
      <p>53 Effernan Rd, Trillick, Omagh, BT78 3SG, Co. Tyrone, UK</p>
      <p className="mt-4">Tel: 028 8956 1897</p>
      <p>We offer click &amp; collect — contact us to arrange collection from our premises.</p>
    </StaticPage>
  );
}
