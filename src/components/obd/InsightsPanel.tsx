"use client";

import { Activity, AlertCircle, CheckCircle2 } from "lucide-react";
import type { InsightSummary } from "@/lib/obd/types";

interface InsightsPanelProps {
  insights: InsightSummary | null;
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  if (!insights) {
    return (
      <section className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="font-semibold text-lg">Vehicle lowdown</h2>
        <p className="mt-2 text-sm text-stone-500">Connect to generate a health summary from live OBD data.</p>
      </section>
    );
  }

  const Icon =
    insights.overall === "good" ? CheckCircle2 : insights.overall === "attention" ? Activity : AlertCircle;
  const color =
    insights.overall === "good"
      ? "border-green-200 bg-green-50 text-green-900"
      : insights.overall === "attention"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-red-200 bg-red-50 text-red-900";

  return (
    <section className={`rounded-xl border p-5 ${color}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-6 w-6 shrink-0" />
        <div>
          <h2 className="font-semibold text-lg">Vehicle lowdown</h2>
          <p className="mt-1 font-medium">{insights.headline}</p>
        </div>
      </div>

      <ul className="mt-4 space-y-1 text-sm">
        {insights.bullets.map((b) => (
          <li key={b}>• {b}</li>
        ))}
      </ul>

      {insights.anomalies.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold">Live anomalies</h3>
          <ul className="mt-1 space-y-1 text-sm">
            {insights.anomalies.map((a) => (
              <li key={a}>⚠ {a}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
