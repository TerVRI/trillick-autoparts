"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { tripChecklist } from "@/lib/calculators/camping";
import { campingRecommendations } from "@/lib/tool-recommendations";

export default function TripPlannerPage() {
  const [days, setDays] = useState(5);
  const [terrain, setTerrain] = useState("mixed gravel and sand");
  const [season, setSeason] = useState("summer");
  const [crew, setCrew] = useState(2);

  const checklist = useMemo(() => tripChecklist(days, terrain, season), [days, terrain, season]);
  const summary = `Trip plan: ${days} days, ${crew} crew, ${terrain}, ${season}. Checklist: ${checklist.join("; ")}`;

  return (
    <ToolLayout
      title="Trip Planner"
      description="Generate a prep checklist based on trip length, terrain, and season."
      recommendations={campingRecommendations("trip")}
      toolContext="trip-planner"
      quoteSummary={summary}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border p-6">
          <label className="block text-sm">Trip length (days)
            <input type="number" min={1} value={days} onChange={(e) => setDays(+e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
          </label>
          <label className="block text-sm">Crew size
            <input type="number" min={1} value={crew} onChange={(e) => setCrew(+e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
          </label>
          <label className="block text-sm">Terrain
            <select value={terrain} onChange={(e) => setTerrain(e.target.value)} className="mt-1 w-full rounded border px-3 py-2">
              <option value="tarmac and gravel">Tarmac & gravel</option>
              <option value="mixed gravel and sand">Mixed gravel & sand</option>
              <option value="mud and rocks">Mud & rocks</option>
            </select>
          </label>
          <label className="block text-sm">Season
            <select value={season} onChange={(e) => setSeason(e.target.value)} className="mt-1 w-full rounded border px-3 py-2">
              <option value="summer">Summer</option>
              <option value="winter">Winter</option>
            </select>
          </label>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <h2 className="font-semibold mb-3">Prep Checklist</h2>
          <ul className="space-y-1 text-sm">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
