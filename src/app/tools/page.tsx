import type { Metadata } from "next";
import Link from "next/link";
import { ToolsHubContent } from "@/components/tools/ToolsHubContent";
import { PageBanner } from "@/components/PageBanner";

export const metadata: Metadata = {
  title: "Adventure Tools | Trillick Auto Parts",
  description: "Free Land Rover tools: off-road calculators, camping planners, OBD lookup, audio wiring, and build configurator.",
};

export default function ToolsHubPage() {
  return (
    <div>
      <PageBanner
        title="Adventure Tools"
        subtitle="Plan your off-road setup, camping power, audio install, and maintenance — then link straight to the Britpart parts you need."
        imageKey="toolsBanner"
      />
      <div className="mx-auto max-w-7xl px-4 py-10">
      <Link
        href="/tools/build-configurator"
        className="mb-10 inline-block rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-500"
      >
        Start Build Configurator →
      </Link>

      <ToolsHubContent />
      </div>
    </div>
  );
}
