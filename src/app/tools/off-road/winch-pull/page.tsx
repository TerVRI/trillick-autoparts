"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { winchPullRequired } from "@/lib/calculators/offroad";
import { offRoadRecommendations } from "@/lib/tool-recommendations";

const SURFACES = [
  { id: "road", label: "Tarmac / hard surface", factor: 0.02 },
  { id: "gravel", label: "Gravel / hard pack", factor: 0.05 },
  { id: "grass", label: "Grass / wet field", factor: 0.15 },
  { id: "mud", label: "Deep mud", factor: 0.3 },
  { id: "sand", label: "Soft sand", factor: 0.25 },
];

export default function WinchPullPage() {
  const [weight, setWeight] = useState(2500);
  const [slope, setSlope] = useState(15);
  const [surface, setSurface] = useState("mud");

  const result = useMemo(() => {
    const sf = SURFACES.find((s) => s.id === surface)?.factor ?? 0.1;
    const minRating = winchPullRequired(weight, slope, sf);
    return { minRating, recommended: Math.ceil(minRating * 1.25) };
  }, [weight, slope, surface]);

  const summary = `Winch calc: ${weight}kg, ${slope}° slope, ${surface}. Min ${result.minRating} kg pull, recommend ${result.recommended} kg rated winch.`;

  return (
    <ToolLayout
      title="Winch Pull Calculator"
      description="Estimate minimum winch line pull with 1.5× safety factor. Use snatch blocks to double effective pull."
      recommendations={offRoadRecommendations("winch")}
      toolContext="winch-pull-calculator"
      quoteSummary={summary}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border p-6">
          <label className="block text-sm font-medium">Vehicle weight (kg)
            <input type="number" value={weight} onChange={(e) => setWeight(+e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="block text-sm font-medium">Slope (degrees)
            <input type="range" min={0} max={45} value={slope} onChange={(e) => setSlope(+e.target.value)} className="mt-1 w-full" />
            <span className="text-sm text-stone-500">{slope}°</span>
          </label>
          <label className="block text-sm font-medium">Surface
            <select value={surface} onChange={(e) => setSurface(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2">
              {SURFACES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>
        <div className="rounded-xl border border-stone-300 bg-stone-50 p-6">
          <p className="text-lg"><strong>Minimum line pull:</strong> ~{result.minRating.toLocaleString()} kg</p>
          <p className="text-lg mt-2"><strong>Recommended winch rating:</strong> {result.recommended.toLocaleString()}+ kg (lb rating ÷ 2.2)</p>
          <ul className="mt-4 text-sm text-stone-600 list-disc pl-5 space-y-1">
            <li>Always use rated recovery points</li>
            <li>Keep bystanders clear of rope under load</li>
            <li>Dampen rope with a recovery blanket</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
