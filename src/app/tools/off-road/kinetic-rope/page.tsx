"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { kineticRopeRating } from "@/lib/calculators/offroad";
import { offRoadRecommendations } from "@/lib/tool-recommendations";

export default function KineticRopePage() {
  const [weight, setWeight] = useState(2500);

  const rating = useMemo(() => kineticRopeRating(weight), [weight]);
  const summary = `Kinetic rope for ${weight}kg vehicle: ${rating.min}–${rating.max} kg MBS recommended.`;

  return (
    <ToolLayout
      title="Kinetic Rope Sizer"
      description="Recovery rope minimum breaking strength should be 2–3× vehicle weight for kinetic snatch recovery."
      recommendations={offRoadRecommendations("kinetic-rope")}
      toolContext="kinetic-rope-sizer"
      quoteSummary={summary}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <label className="block rounded-xl border p-6 text-sm font-medium">
          Vehicle weight (kg)
          <input type="number" value={weight} onChange={(e) => setWeight(+e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2" />
        </label>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
          <p><strong>Minimum MBS:</strong> {rating.min.toLocaleString()} kg</p>
          <p className="mt-2"><strong>Ideal range:</strong> {rating.min.toLocaleString()} – {rating.max.toLocaleString()} kg</p>
          <p className="mt-4 text-sm text-orange-900">Never use kinetic rope on a winch. Match soft shackles to rope rating. Inspect after every use.</p>
        </div>
      </div>
    </ToolLayout>
  );
}
