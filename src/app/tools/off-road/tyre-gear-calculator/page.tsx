"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import {
  speedometerError,
  effectiveGearRatio,
  suggestedRegear,
  tyreDiameterFromMetric,
} from "@/lib/calculators/offroad";
import { offRoadRecommendations } from "@/lib/tool-recommendations";

export default function TyreGearCalculatorPage() {
  const [oldW, setOldW] = useState(235);
  const [oldA, setOldA] = useState(85);
  const [oldR, setOldR] = useState(16);
  const [newW, setNewW] = useState(265);
  const [newA, setNewA] = useState(70);
  const [newR, setNewR] = useState(16);
  const [axle, setAxle] = useState(3.73);

  const result = useMemo(() => {
    const oldD = tyreDiameterFromMetric(oldW, oldA, oldR);
    const newD = tyreDiameterFromMetric(newW, newA, newR);
    const err = speedometerError(oldD, newD);
    const eff = effectiveGearRatio(axle, oldD, newD);
    const regear = suggestedRegear(axle, oldD, newD);
    return { oldD: oldD.toFixed(1), newD: newD.toFixed(1), err, eff: eff.toFixed(2), regear };
  }, [oldW, oldA, oldR, newW, newA, newR, axle]);

  const summary = `Tyre change ${oldW}/${oldA}R${oldR} → ${newW}/${newA}R${newR}. Speedo error ${result.err.toFixed(1)}%. Effective ratio ${result.eff}. Suggested regear ${result.regear}.`;

  return (
    <ToolLayout
      title="Tyre & Gear Calculator"
      description="Calculate speedometer error and effective gear ratio when changing tyre size."
      recommendations={offRoadRecommendations("tyre-gear")}
      toolContext="tyre-gear-calculator"
      quoteSummary={summary}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border p-6">
          <h3 className="font-semibold">Old Tyres</h3>
          <div className="grid grid-cols-3 gap-2">
            <input type="number" value={oldW} onChange={(e) => setOldW(+e.target.value)} placeholder="Width" className="rounded border px-2 py-1" />
            <input type="number" value={oldA} onChange={(e) => setOldA(+e.target.value)} placeholder="Aspect" className="rounded border px-2 py-1" />
            <input type="number" value={oldR} onChange={(e) => setOldR(+e.target.value)} placeholder="Rim" className="rounded border px-2 py-1" />
          </div>
          <h3 className="font-semibold pt-2">New Tyres</h3>
          <div className="grid grid-cols-3 gap-2">
            <input type="number" value={newW} onChange={(e) => setNewW(+e.target.value)} className="rounded border px-2 py-1" />
            <input type="number" value={newA} onChange={(e) => setNewA(+e.target.value)} className="rounded border px-2 py-1" />
            <input type="number" value={newR} onChange={(e) => setNewR(+e.target.value)} className="rounded border px-2 py-1" />
          </div>
          <label className="block text-sm">Axle ratio
            <input type="number" step="0.01" value={axle} onChange={(e) => setAxle(+e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
          </label>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 space-y-3">
          <p><strong>Old diameter:</strong> {result.oldD}&quot;</p>
          <p><strong>New diameter:</strong> {result.newD}&quot;</p>
          <p><strong>Speedometer error:</strong> {result.err > 0 ? "+" : ""}{result.err.toFixed(1)}% {result.err > 0 ? "(reads slow)" : result.err < 0 ? "(reads fast)" : ""}</p>
          <p><strong>Effective gear ratio:</strong> {result.eff}</p>
          <p><strong>Suggested regear:</strong> {result.regear}</p>
        </div>
      </div>
    </ToolLayout>
  );
}
