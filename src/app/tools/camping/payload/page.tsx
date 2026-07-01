"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { payloadRemaining } from "@/lib/calculators/camping";
import { campingRecommendations } from "@/lib/tool-recommendations";

export default function PayloadPage() {
  const [gvm, setGvm] = useState(3500);
  const [kerb, setKerb] = useState(2200);
  const [passengers, setPassengers] = useState(180);
  const [cargo, setCargo] = useState(400);

  const result = useMemo(() => payloadRemaining(gvm, kerb, passengers, cargo), [gvm, kerb, passengers, cargo]);
  const over = result.remaining < 0;
  const summary = `Payload: GVM ${gvm}kg, kerb ${kerb}kg, pax ${passengers}kg, cargo ${cargo}kg. Remaining ${result.remaining}kg (${result.percent}% used).`;

  return (
    <ToolLayout
      title="Payload Calculator"
      description="Check remaining payload with passengers, roof load, water, fuel, and camping gear."
      recommendations={campingRecommendations("payload")}
      toolContext="payload-calculator"
      quoteSummary={summary}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3 rounded-xl border p-6">
          {[
            ["GVM (kg)", gvm, setGvm],
            ["Kerb weight (kg)", kerb, setKerb],
            ["Passengers + gear in cab (kg)", passengers, setPassengers],
            ["Roof rack, tent, water, tools (kg)", cargo, setCargo],
          ].map(([label, val, set]) => (
            <label key={label as string} className="block text-sm">
              {label as string}
              <input type="number" value={val as number} onChange={(e) => (set as (n: number) => void)(+e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
            </label>
          ))}
        </div>
        <div className={`rounded-xl border p-6 ${over ? "border-red-300 bg-red-50" : "border-green-200 bg-green-50"}`}>
          <p><strong>Total used:</strong> {result.used.toLocaleString()} kg</p>
          <p className="mt-2 text-xl font-bold">{over ? "OVER GVM" : "Remaining payload:"} {Math.abs(result.remaining).toLocaleString()} kg</p>
          <p className="mt-2 text-sm">{result.percent}% of GVM used</p>
          {over && <p className="mt-3 text-sm text-red-800">Reduce load or upgrade suspension/GVM where legally permitted.</p>}
        </div>
      </div>
    </ToolLayout>
  );
}
