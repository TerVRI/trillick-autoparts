"use client";

interface GaugeCardProps {
  label: string;
  value: number | null;
  unit: string;
  supported?: boolean;
  max?: number;
  accent?: string;
}

export function GaugeCard({ label, value, unit, supported = true, max, accent = "bg-amber-500" }: GaugeCardProps) {
  const display = value !== null ? (Number.isInteger(value) ? value : value.toFixed(1)) : "—";
  const pct = value !== null && max ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div className={`rounded-xl border p-4 ${supported ? "border-stone-200 bg-white" : "border-stone-100 bg-stone-50 opacity-60"}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-stone-900">
        {display}
        {value !== null && unit && <span className="ml-1 text-sm font-normal text-stone-500">{unit}</span>}
      </p>
      {max !== undefined && value !== null && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-100">
          <div className={`h-full rounded-full ${accent}`} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
