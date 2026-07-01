import type { Metadata } from "next";
import Link from "next/link";
import { ToolsHubContent } from "@/components/tools/ToolsHubContent";

export const metadata: Metadata = {
  title: "Adventure Tools | Trillick Auto Parts",
  description: "Free Land Rover tools: off-road calculators, camping planners, OBD lookup, audio wiring, and build configurator.",
};

export default function ToolsHubPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold uppercase text-stone-900 md:text-4xl">
          Adventure Tools
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-stone-600">
          Plan your off-road setup, camping power, audio install, and maintenance — then link straight to the Britpart parts you need.
        </p>
        <Link
          href="/tools/build-configurator"
          className="mt-4 inline-block rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-500"
        >
          Start Build Configurator →
        </Link>
      </header>

      <ToolsHubContent />
    </div>
  );
}
