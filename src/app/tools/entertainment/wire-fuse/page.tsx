"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { ampWireGauge } from "@/lib/calculators/entertainment";
import { entertainmentRecommendations } from "@/lib/tool-recommendations";

export default function WireFusePage() {
  const [watts, setWatts] = useState(500);
  const [length, setLength] = useState(4);
  const [efficiency, setEfficiency] = useState<"class-d" | "class-ab">("class-d");
  const [voltage] = useState(12);

  const result = useMemo(() => ampWireGauge(watts, voltage, length, efficiency), [watts, voltage, length, efficiency]);
  const summary = `Amp ${watts}W ${efficiency}, ${length}m run: ${result.awg} AWG, ${result.fuseAmps}A fuse, ~${result.currentDraw}A draw.`;

  return (
    <ToolLayout
      title="Amplifier Wire & Fuse Calculator"
      description="Recommended power cable gauge and fuse size for 12V car audio installs."
      recommendations={entertainmentRecommendations()}
      toolContext="wire-fuse-calculator"
      quoteSummary={summary}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border p-6">
          <label className="block text-sm">Amp RMS power (W)
            <input type="number" value={watts} onChange={(e) => setWatts(+e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
          </label>
          <label className="block text-sm">Cable run length (m, one way)
            <input type="number" step="0.5" value={length} onChange={(e) => setLength(+e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
          </label>
          <label className="block text-sm">Amp class
            <select value={efficiency} onChange={(e) => setEfficiency(e.target.value as typeof efficiency)} className="mt-1 w-full rounded border px-3 py-2">
              <option value="class-d">Class D (~85% efficient)</option>
              <option value="class-ab">Class AB (~60% efficient)</option>
            </select>
          </label>
        </div>
        <div className="rounded-xl border bg-stone-50 p-6 space-y-2">
          <p><strong>Current draw:</strong> ~{result.currentDraw} A</p>
          <p><strong>Recommended wire:</strong> {result.awg} AWG OFC</p>
          <p><strong>Fuse at battery:</strong> {result.fuseAmps} A ANL/MIDI</p>
          <p className="text-xs pt-2">Use fused distribution block. Ground within 45cm of amp.</p>
        </div>
      </div>
    </ToolLayout>
  );
}
