"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { audioBuildPlan } from "@/lib/calculators/entertainment";
import { entertainmentRecommendations } from "@/lib/tool-recommendations";

const VEHICLES = ["Defender 90/110", "Discovery 3/4", "Range Rover Sport", "Freelander 2"];

export default function AudioBuildPage() {
  const [vehicle, setVehicle] = useState(VEHICLES[0]);
  const [budget, setBudget] = useState<"basic" | "mid" | "premium">("mid");
  const [wantsSub, setWantsSub] = useState(true);

  const plan = useMemo(() => audioBuildPlan(vehicle, budget, wantsSub), [vehicle, budget, wantsSub]);
  const summary = plan.map((p) => `${p.component}: ${p.recommendation}`).join("\n");

  return (
    <ToolLayout
      title="Land Rover Audio Build Planner"
      description="Plan a head unit, speakers, sub, and wiring for your Land Rover audio upgrade."
      recommendations={entertainmentRecommendations()}
      toolContext="audio-build-planner"
      quoteSummary={summary}
    >
      <div className="mb-6 flex flex-wrap gap-4">
        <select value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="rounded border px-3 py-2">
          {VEHICLES.map((v) => <option key={v}>{v}</option>)}
        </select>
        <select value={budget} onChange={(e) => setBudget(e.target.value as typeof budget)} className="rounded border px-3 py-2">
          <option value="basic">Basic</option>
          <option value="mid">Mid-range</option>
          <option value="premium">Premium</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={wantsSub} onChange={(e) => setWantsSub(e.target.checked)} />
          Include subwoofer
        </label>
      </div>
      <div className="space-y-3">
        {plan.map((item) => (
          <div key={item.component} className="rounded-xl border p-4">
            <h3 className="font-semibold">{item.component}</h3>
            <p className="text-sm text-stone-600 mt-1">{item.recommendation}</p>
          </div>
        ))}
      </div>
    </ToolLayout>
  );
}
