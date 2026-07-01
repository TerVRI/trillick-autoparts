"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { tyrePressureByTerrain } from "@/lib/calculators/offroad";
import { offRoadRecommendations } from "@/lib/tool-recommendations";

export default function TyrePressurePage() {
  const [weight, setWeight] = useState(2200);
  const [tyreWidth, setTyreWidth] = useState(265);
  const [roadPsi, setRoadPsi] = useState(36);

  const pressures = useMemo(() => ({
    road: roadPsi,
    gravel: tyrePressureByTerrain(roadPsi, "gravel"),
    sand: tyrePressureByTerrain(roadPsi, "sand"),
    mud: tyrePressureByTerrain(roadPsi, "mud"),
    rocks: tyrePressureByTerrain(roadPsi, "rocks"),
  }), [roadPsi]);

  const summary = `Vehicle ~${weight}kg, ${tyreWidth}mm tyres. Road ${pressures.road} PSI, gravel ${pressures.gravel}, sand ${pressures.sand}, mud ${pressures.mud}, rocks ${pressures.rocks} PSI.`;

  return (
    <ToolLayout
      title="Tyre Pressure Calculator"
      description="Estimate starting tyre pressures for different terrains. Always adjust for load, temperature, and bead retention."
      recommendations={offRoadRecommendations("tyre-pressure")}
      toolContext="tyre-pressure-calculator"
      quoteSummary={summary}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-6">
          <label className="block text-sm font-medium">Vehicle weight (kg)
            <input type="number" value={weight} onChange={(e) => setWeight(+e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="block text-sm font-medium">Tyre width (mm)
            <input type="number" value={tyreWidth} onChange={(e) => setTyreWidth(+e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="block text-sm font-medium">Road PSI (baseline)
            <input type="number" value={roadPsi} onChange={(e) => setRoadPsi(+e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <h2 className="font-semibold text-green-900 mb-4">Recommended Starting PSI</h2>
          <ul className="space-y-2 text-sm">
            {Object.entries(pressures).map(([terrain, psi]) => (
              <li key={terrain} className="flex justify-between capitalize">
                <span>{terrain}</span>
                <strong>{psi} PSI</strong>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-green-800">Re-inflate before returning to tarmac. Wide tyres may need lower sand pressures.</p>
        </div>
      </div>
    </ToolLayout>
  );
}
