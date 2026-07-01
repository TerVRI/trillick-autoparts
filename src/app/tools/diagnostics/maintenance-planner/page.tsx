"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { maintenanceDue } from "@/lib/maintenance-schedules";
import { diagnosticsRecommendations } from "@/lib/tool-recommendations";

export default function MaintenancePlannerPage() {
  const [miles, setMiles] = useState(85000);
  const [lastService, setLastService] = useState(78000);
  const [months, setMonths] = useState(14);

  const items = useMemo(() => maintenanceDue(miles, lastService, months), [miles, lastService, months]);
  const due = items.filter((i) => i.due);
  const summary = due.map((d) => `${d.item.item} (${d.reason})`).join("; ") || "All items OK for now.";

  return (
    <ToolLayout
      title="Maintenance Planner"
      description="Service reminders based on mileage and time since last service."
      recommendations={diagnosticsRecommendations(["service-kits", "consumables", "repair-and-service-parts"], ["filter", "oil", "service kit"])}
      toolContext="maintenance-planner"
      quoteSummary={summary}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3 rounded-xl border p-6">
          <label className="block text-sm">Current mileage
            <input type="number" value={miles} onChange={(e) => setMiles(+e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
          </label>
          <label className="block text-sm">Mileage at last service
            <input type="number" value={lastService} onChange={(e) => setLastService(+e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
          </label>
          <label className="block text-sm">Months since last service
            <input type="number" value={months} onChange={(e) => setMonths(+e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
          </label>
        </div>
        <div className="rounded-xl border p-6">
          <h3 className="font-semibold mb-3">Service items</h3>
          <ul className="space-y-2 text-sm">
            {items.map(({ item, due, reason }) => (
              <li key={item.item} className={`flex justify-between gap-2 rounded p-2 ${due ? "bg-amber-50" : "bg-stone-50"}`}>
                <span>{item.item}</span>
                <span className={`shrink-0 text-xs ${due ? "text-amber-800 font-medium" : "text-stone-400"}`}>{due ? reason : "OK"}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
