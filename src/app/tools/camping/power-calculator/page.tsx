"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { dailyWh, batteryAhRequired, solarWattsRequired, type ApplianceLoad } from "@/lib/calculators/camping";
import { campingRecommendations } from "@/lib/tool-recommendations";

const DEFAULT_LOADS: ApplianceLoad[] = [
  { name: "Fridge (40W avg)", watts: 40, hoursPerDay: 24, dutyCycle: 0.35 },
  { name: "LED lights", watts: 20, hoursPerDay: 4 },
  { name: "Phone/laptop", watts: 30, hoursPerDay: 2 },
  { name: "Compressor", watts: 200, hoursPerDay: 0.25 },
];

export default function PowerCalculatorPage() {
  const [loads, setLoads] = useState(DEFAULT_LOADS);
  const [days, setDays] = useState(2);
  const [voltage, setVoltage] = useState(12);
  const [sunHours, setSunHours] = useState(4);
  const [dod, setDod] = useState(0.5);

  const result = useMemo(() => {
    const wh = dailyWh(loads);
    const ah = batteryAhRequired(wh, voltage, days, dod);
    const solar = solarWattsRequired(wh, sunHours);
    const dcdc = Math.ceil(wh / voltage / 5);
    return { wh, ah, solar, dcdc };
  }, [loads, days, voltage, sunHours, dod]);

  const summary = `12V power: ${result.wh}Wh/day, ${result.ah}Ah battery (${days} days), ${result.solar}W solar, DC-DC ~${result.dcdc}A suggested.`;

  return (
    <ToolLayout
      title="12V Battery & Solar Calculator"
      description="Size your auxiliary battery, solar panel, and DC-DC charger for off-grid camping."
      recommendations={campingRecommendations("power")}
      toolContext="power-calculator"
      quoteSummary={summary}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border p-6 space-y-4">
          <h3 className="font-semibold">Appliances</h3>
          {loads.map((l, i) => (
            <div key={l.name} className="grid grid-cols-3 gap-2 text-xs">
              <span className="col-span-3 font-medium">{l.name}</span>
              <input type="number" value={l.watts} onChange={(e) => {
                const next = [...loads]; next[i] = { ...l, watts: +e.target.value }; setLoads(next);
              }} className="rounded border px-2 py-1" placeholder="W" />
              <input type="number" value={l.hoursPerDay} onChange={(e) => {
                const next = [...loads]; next[i] = { ...l, hoursPerDay: +e.target.value }; setLoads(next);
              }} className="rounded border px-2 py-1" placeholder="hrs/day" />
              <input type="number" step="0.1" value={l.dutyCycle ?? 1} onChange={(e) => {
                const next = [...loads]; next[i] = { ...l, dutyCycle: +e.target.value }; setLoads(next);
              }} className="rounded border px-2 py-1" placeholder="duty" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <label className="text-sm">Days off-grid
              <input type="number" value={days} onChange={(e) => setDays(+e.target.value)} className="mt-1 w-full rounded border px-2 py-1" />
            </label>
            <label className="text-sm">Peak sun hours
              <input type="number" step="0.5" value={sunHours} onChange={(e) => setSunHours(+e.target.value)} className="mt-1 w-full rounded border px-2 py-1" />
            </label>
          </div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 space-y-3">
          <p><strong>Daily consumption:</strong> {result.wh} Wh</p>
          <p><strong>Battery (LiFePO4 @ {Math.round(dod * 100)}% DoD):</strong> {result.ah} Ah @ {voltage}V</p>
          <p><strong>Solar panel:</strong> ~{result.solar} W</p>
          <p><strong>DC-DC charger:</strong> ~{result.dcdc} A (while driving)</p>
          <p className="text-xs text-amber-900">Add 20% headroom for cloudy days. Use ANL fuse on main feed.</p>
        </div>
      </div>
    </ToolLayout>
  );
}
