"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { waterLitresPerDay } from "@/lib/calculators/camping";
import { campingRecommendations } from "@/lib/tool-recommendations";

export default function WaterPlannerPage() {
  const [crew, setCrew] = useState(2);
  const [days, setDays] = useState(5);
  const [hot, setHot] = useState(false);

  const water = useMemo(() => waterLitresPerDay(crew, days, hot), [crew, days, hot]);
  const summary = `Water plan: ${crew} people, ${days} days. Total ${water.total}L (drink ${water.drinking}, cook ${water.cooking}, wash ${water.washing}).`;

  return (
    <ToolLayout
      title="Water Planner"
      description="Estimate drinking, cooking, and washing water for overland trips."
      recommendations={campingRecommendations("water")}
      toolContext="water-planner"
      quoteSummary={summary}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border p-6">
          <label className="block text-sm">Crew size
            <input type="number" min={1} value={crew} onChange={(e) => setCrew(+e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
          </label>
          <label className="block text-sm">Trip days
            <input type="number" min={1} value={days} onChange={(e) => setDays(+e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={hot} onChange={(e) => setHot(e.target.checked)} />
            Hot / dry weather (+1L drinking per person per day)
          </label>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 space-y-2">
          <p><strong>Drinking:</strong> {water.drinking} L</p>
          <p><strong>Cooking:</strong> {water.cooking} L</p>
          <p><strong>Washing:</strong> {water.washing} L</p>
          <p className="text-xl font-bold pt-2">Total: {water.total} L</p>
          <p className="text-xs">Add 20% buffer. Jerry cans at ~20L each → {Math.ceil(water.total * 1.2 / 20)} containers.</p>
        </div>
      </div>
    </ToolLayout>
  );
}
