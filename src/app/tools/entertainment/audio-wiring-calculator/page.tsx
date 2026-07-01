"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { subImpedance } from "@/lib/calculators/entertainment";
import { entertainmentRecommendations } from "@/lib/tool-recommendations";

export default function AudioWiringPage() {
  const [count, setCount] = useState(2);
  const [coilType, setCoilType] = useState<"SVC" | "DVC">("DVC");
  const [ohms, setOhms] = useState(4);
  const [wiring, setWiring] = useState<"parallel" | "series" | "parallel-coils">("parallel-coils");

  const result = useMemo(() => subImpedance(count, coilType, ohms, wiring), [count, coilType, ohms, wiring]);
  const summary = `Sub wiring: ${result.description}. Final load ${result.finalOhms.toFixed(2)}Ω.`;

  return (
    <ToolLayout
      title="Subwoofer Wiring / Impedance Calculator"
      description="Calculate final amplifier load for SVC and DVC subwoofers."
      recommendations={entertainmentRecommendations()}
      toolContext="audio-wiring-calculator"
      quoteSummary={summary}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border p-6">
          <label className="block text-sm">Number of subs
            <input type="number" min={1} max={4} value={count} onChange={(e) => setCount(+e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
          </label>
          <label className="block text-sm">Coil type
            <select value={coilType} onChange={(e) => setCoilType(e.target.value as "SVC" | "DVC")} className="mt-1 w-full rounded border px-3 py-2">
              <option value="SVC">SVC (single voice coil)</option>
              <option value="DVC">DVC (dual voice coil)</option>
            </select>
          </label>
          <label className="block text-sm">Coil impedance (Ω)
            <select value={ohms} onChange={(e) => setOhms(+e.target.value)} className="mt-1 w-full rounded border px-3 py-2">
              <option value={2}>2Ω</option>
              <option value={4}>4Ω</option>
            </select>
          </label>
          <label className="block text-sm">Wiring
            <select value={wiring} onChange={(e) => setWiring(e.target.value as typeof wiring)} className="mt-1 w-full rounded border px-3 py-2">
              <option value="parallel">Parallel</option>
              <option value="series">Series</option>
              {coilType === "DVC" && <option value="parallel-coils">DVC: parallel coils, subs parallel</option>}
            </select>
          </label>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-6">
          <p className="text-2xl font-bold">{result.finalOhms.toFixed(2)} Ω</p>
          <p className="mt-2 text-sm">{result.description}</p>
          <p className="mt-4 text-xs">Choose an amp stable at this load. Never run below amp minimum impedance.</p>
        </div>
      </div>
    </ToolLayout>
  );
}
