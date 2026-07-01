"use client";

import Link from "next/link";
import { lookupDtc } from "@/lib/dtc-codes";
import type { DiagnosticSnapshot } from "@/lib/obd/types";

interface DiagnosticsPanelProps {
  diagnostics: DiagnosticSnapshot;
}

export function DiagnosticsPanel({ diagnostics }: DiagnosticsPanelProps) {
  const stored = diagnostics.dtcs.filter((d) => d.type === "stored");
  const pending = diagnostics.dtcs.filter((d) => d.type === "pending");

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
      <h2 className="font-semibold text-lg">Diagnostics</h2>

      {diagnostics.vin && (
        <div className="rounded-lg bg-stone-50 px-3 py-2 text-sm">
          <span className="text-stone-500">VIN </span>
          <span className="font-mono font-medium">{diagnostics.vin}</span>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-stone-700">Stored fault codes</h3>
        {stored.length === 0 ? (
          <p className="mt-1 text-sm text-green-700">None</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {stored.map((d) => {
              const entry = lookupDtc(d.code);
              return (
                <li key={d.code} className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold">{d.code}</span>
                    {entry && (
                      <Link href="/tools/diagnostics/obd-code-lookup" className="text-amber-700 hover:underline">
                        {entry.title}
                      </Link>
                    )}
                  </div>
                  {entry && <p className="mt-1 text-stone-600">{entry.description}</p>}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-stone-700">Pending codes</h3>
        {pending.length === 0 ? (
          <p className="mt-1 text-sm text-stone-500">None</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {pending.map((d) => (
              <span key={d.code} className="rounded-full bg-amber-100 px-3 py-1 font-mono text-xs text-amber-900">
                {d.code}
              </span>
            ))}
          </ul>
        )}
      </div>

      {diagnostics.readiness.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-stone-700">Readiness monitors</h3>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {diagnostics.readiness.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded border px-2 py-1 text-xs">
                <span>{m.label}</span>
                <span
                  className={
                    m.status === "complete"
                      ? "text-green-700"
                      : m.status === "incomplete"
                        ? "text-amber-700"
                        : "text-stone-400"
                  }
                >
                  {m.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
