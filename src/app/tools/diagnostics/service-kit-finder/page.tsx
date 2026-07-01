"use client";

import { useState } from "react";
import Link from "next/link";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { diagnosticsRecommendations } from "@/lib/tool-recommendations";

const MODELS = ["Defender", "Discovery 3/4", "Range Rover Sport", "Freelander 2", "Classic Defender"];
const SERVICE_TYPES = [
  { id: "minor", label: "Minor service", items: ["Engine oil & filter", "Air filter check", "Fluid top-ups", "Visual inspection"] },
  { id: "major", label: "Major service", items: ["Oil & all filters", "Brake fluid", "Spark plugs (petrol)", "Diff & transfer box oil check"] },
  { id: "timing", label: "Timing belt service", items: ["Timing belt/chain kit", "Water pump", "Tensioners", "Coolant flush"] },
];

export default function ServiceKitFinderPage() {
  const [model, setModel] = useState(MODELS[0]);
  const [service, setService] = useState(SERVICE_TYPES[0].id);
  const selected = SERVICE_TYPES.find((s) => s.id === service)!;
  const summary = `${model} — ${selected.label}: ${selected.items.join(", ")}`;

  return (
    <ToolLayout
      title="Service Kit Finder"
      description="Find the right service kit type for your Land Rover, then browse Britpart service kits."
      recommendations={diagnosticsRecommendations(["service-kits", "consumables", "repair-and-service-parts"], ["service kit", model.toLowerCase()])}
      toolContext="service-kit-finder"
      quoteSummary={summary}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border p-6">
          <label className="block text-sm">Vehicle model
            <select value={model} onChange={(e) => setModel(e.target.value)} className="mt-1 w-full rounded border px-3 py-2">
              {MODELS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
          <label className="block text-sm">Service type
            <select value={service} onChange={(e) => setService(e.target.value)} className="mt-1 w-full rounded border px-3 py-2">
              {SERVICE_TYPES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>
        <div className="rounded-xl border bg-stone-50 p-6">
          <h3 className="font-semibold">{selected.label} for {model}</h3>
          <ul className="mt-3 list-disc pl-5 text-sm space-y-1">
            {selected.items.map((i) => <li key={i}>{i}</li>)}
          </ul>
          <Link href="/britpart/service-kits" className="mt-4 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500">
            Browse Service Kits →
          </Link>
        </div>
      </div>
    </ToolLayout>
  );
}
