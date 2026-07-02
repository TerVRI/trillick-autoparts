import { StaticPage } from "@/components/StaticPage";
import { LocationMap } from "@/components/LocationMap";
import { getLocation, getPageContent } from "@/lib/site-content";

export const metadata = { title: "Location" };

export default function LocationPage() {
  const page = getPageContent("location");
  const loc = getLocation();

  return (
    <StaticPage title={page?.title ?? "Location"}>
      <div className="space-y-6 not-prose">
        <div>
          <h2 className="font-display text-xl font-bold uppercase text-stone-900">Map of our location</h2>
          <LocationMap className="mt-4" />
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <p className="font-semibold text-stone-900">Trillick Auto Parts Centre</p>
          <p className="mt-2 text-stone-600">{loc.address}</p>
          <p className="mt-2">
            <a href={`tel:${loc.phone.replace(/\s/g, "")}`} className="text-amber-700 hover:underline">
              Tel: {loc.phone}
            </a>
          </p>
          <p className="mt-4 text-stone-600">
            We offer click &amp; collect — contact us to arrange collection from our premises.
          </p>
        </div>
      </div>
    </StaticPage>
  );
}
