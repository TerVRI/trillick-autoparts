"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { gearListItems } from "@/lib/calculators/camping";
import { campingRecommendations } from "@/lib/tool-recommendations";

export default function GearListPage() {
  const [tripLength, setTripLength] = useState<"weekend" | "week" | "expedition">("weekend");
  const [terrain, setTerrain] = useState("general");

  const lists = useMemo(() => gearListItems(tripLength, terrain), [tripLength, terrain]);
  const summary = lists.map((l) => `${l.category}: ${l.items.join(", ")}`).join("\n");

  return (
    <ToolLayout
      title="Gear List Builder"
      description="Custom packing lists for recovery, camping, spares, and documents."
      recommendations={campingRecommendations("gear-list")}
      toolContext="gear-list-builder"
      quoteSummary={summary}
    >
      <div className="mb-6 flex flex-wrap gap-4">
        <select value={tripLength} onChange={(e) => setTripLength(e.target.value as typeof tripLength)} className="rounded border px-3 py-2 text-sm">
          <option value="weekend">Weekend</option>
          <option value="week">Week</option>
          <option value="expedition">Expedition</option>
        </select>
        <select value={terrain} onChange={(e) => setTerrain(e.target.value)} className="rounded border px-3 py-2 text-sm">
          <option value="general">General</option>
          <option value="rock">Rock / technical</option>
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {lists.map((section) => (
          <div key={section.category} className="rounded-xl border p-5">
            <h3 className="font-semibold mb-2">{section.category}</h3>
            <ul className="space-y-1 text-sm">
              {section.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <input type="checkbox" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </ToolLayout>
  );
}
