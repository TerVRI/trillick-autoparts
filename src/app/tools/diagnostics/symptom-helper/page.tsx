"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { SYMPTOMS } from "@/lib/symptoms";
import { diagnosticsRecommendations } from "@/lib/tool-recommendations";

export default function SymptomHelperPage() {
  const [selected, setSelected] = useState(SYMPTOMS[0].id);
  const symptom = SYMPTOMS.find((s) => s.id === selected)!;

  return (
    <ToolLayout
      title="Symptom-to-Parts Helper"
      description="Choose a symptom to see checks and related part categories."
      recommendations={diagnosticsRecommendations(symptom.relatedCategories, symptom.searchTerms)}
      toolContext="symptom-helper"
      quoteSummary={`Symptom: ${symptom.label}. Checks: ${symptom.checks.join("; ")}`}
    >
      <select value={selected} onChange={(e) => setSelected(e.target.value)} className="mb-6 w-full rounded-lg border px-3 py-2 md:w-auto">
        {SYMPTOMS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>
      <div className="rounded-xl border p-6">
        <h2 className="font-semibold text-lg">{symptom.label}</h2>
        <h3 className="mt-4 font-medium text-stone-600">Suggested checks</h3>
        <ol className="mt-2 list-decimal pl-5 space-y-1 text-sm">
          {symptom.checks.map((c) => <li key={c}>{c}</li>)}
        </ol>
      </div>
    </ToolLayout>
  );
}
