"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { lookupDtc, DTC_CODES } from "@/lib/dtc-codes";
import { diagnosticsRecommendations } from "@/lib/tool-recommendations";

export default function ObdCodeLookupPage() {
  const [code, setCode] = useState("");
  const result = lookupDtc(code);

  const severityColor = {
    low: "text-yellow-800 bg-yellow-50 border-yellow-200",
    medium: "text-orange-800 bg-orange-50 border-orange-200",
    high: "text-red-800 bg-red-50 border-red-200",
  };

  return (
    <ToolLayout
      title="OBD Code Lookup"
      description="Look up common fault codes in plain English. This is a reference tool — not live OBD scanning."
      recommendations={result ? diagnosticsRecommendations(result.relatedCategories, result.searchTerms) : diagnosticsRecommendations(["repair-and-service-parts"], ["diagnostic"])}
      toolContext="obd-code-lookup"
      quoteSummary={result ? `${result.code}: ${result.title}. ${result.description}` : undefined}
    >
      <div className="space-y-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. P0300"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="flex-1 rounded-lg border px-4 py-2 font-mono uppercase"
          />
        </div>

        {code && !result && (
          <p className="text-stone-500">Code not in our starter database. Try P0300, P0420, P0171, or contact us with your full scan report.</p>
        )}

        {result && (
          <div className={`rounded-xl border p-6 ${severityColor[result.severity]}`}>
            <p className="font-mono text-sm">{result.code}</p>
            <h2 className="text-xl font-bold mt-1">{result.title}</h2>
            <p className="mt-2">{result.description}</p>
            <p className="mt-2 text-sm capitalize"><strong>Severity:</strong> {result.severity}</p>
            <h3 className="font-semibold mt-4">Likely causes</h3>
            <ul className="list-disc pl-5 text-sm mt-1">
              {result.likelyCauses.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
        )}

        <div>
          <h3 className="font-semibold mb-2 text-sm text-stone-500">Common codes</h3>
          <div className="flex flex-wrap gap-2">
            {DTC_CODES.slice(0, 8).map((d) => (
              <button key={d.code} type="button" onClick={() => setCode(d.code)} className="rounded-full border px-3 py-1 text-xs font-mono hover:bg-stone-100">{d.code}</button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
