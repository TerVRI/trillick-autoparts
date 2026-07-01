"use client";

import { MVP_PIDS } from "@/lib/obd/capabilities";
import type { LivePidValue } from "@/lib/obd/types";
import { GaugeCard } from "./GaugeCard";

interface GaugesPanelProps {
  pids: Record<string, LivePidValue>;
  connected: boolean;
}

const GAUGE_MAX: Record<string, number> = {
  "0C": 6000,
  "0D": 180,
  "05": 120,
  "0F": 60,
  "11": 100,
  "04": 100,
  "06": 30,
  "10": 300,
  "0B": 255,
  "42": 16,
};

export function GaugesPanel({ pids, connected }: GaugesPanelProps) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5">
      <h2 className="font-semibold text-lg">Live gauges</h2>
      <p className="mt-1 text-sm text-stone-500">
        {connected ? "Polling standard Mode 01 PIDs at ~2 Hz." : "Connect or use Simulator to see live data."}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {MVP_PIDS.map((def) => {
          const live = pids[def.pid];
          return (
            <GaugeCard
              key={def.pid}
              label={def.label}
              value={live?.value ?? null}
              unit={def.unit}
              supported={live?.supported ?? false}
              max={GAUGE_MAX[def.pid]}
            />
          );
        })}
      </div>
    </section>
  );
}
