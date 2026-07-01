"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { approachAngle, departureAngle, breakoverAngle } from "@/lib/calculators/offroad";
import { offRoadRecommendations } from "@/lib/tool-recommendations";

export default function ApproachAnglesPage() {
  const [wheelbase, setWheelbase] = useState(2560);
  const [frontOh, setFrontOh] = useState(900);
  const [rearOh, setRearOh] = useState(1100);
  const [clearance, setClearance] = useState(220);

  const angles = useMemo(() => ({
    approach: approachAngle(wheelbase, frontOh, clearance),
    departure: departureAngle(wheelbase, rearOh, clearance),
    breakover: breakoverAngle(wheelbase, frontOh, rearOh, clearance),
  }), [wheelbase, frontOh, rearOh, clearance]);

  const summary = `Geometry: approach ${angles.approach}°, departure ${angles.departure}°, breakover ${angles.breakover}°.`;

  return (
    <ToolLayout
      title="Approach / Departure / Breakover Calculator"
      description="Estimate off-road geometry from wheelbase, overhangs, and ride height (mm)."
      recommendations={offRoadRecommendations("geometry")}
      toolContext="approach-angles-calculator"
      quoteSummary={summary}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3 rounded-xl border p-6">
          {[
            ["Wheelbase (mm)", wheelbase, setWheelbase],
            ["Front overhang (mm)", frontOh, setFrontOh],
            ["Rear overhang (mm)", rearOh, setRearOh],
            ["Ride height / clearance (mm)", clearance, setClearance],
          ].map(([label, val, set]) => (
            <label key={label as string} className="block text-sm font-medium">
              {label as string}
              <input type="number" value={val as number} onChange={(e) => (set as (n: number) => void)(+e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
            </label>
          ))}
        </div>
        <div className="rounded-xl border bg-stone-50 p-6 space-y-2">
          <p><strong>Approach angle:</strong> {angles.approach}°</p>
          <p><strong>Departure angle:</strong> {angles.departure}°</p>
          <p><strong>Breakover angle:</strong> {angles.breakover}°</p>
          <p className="text-xs text-stone-500 pt-2">Lift kits and larger tyres change effective geometry — remeasure after mods.</p>
        </div>
      </div>
    </ToolLayout>
  );
}
