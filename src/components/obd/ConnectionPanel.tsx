"use client";

import { Plug, Unplug, RefreshCw, Shield, ShieldAlert } from "lucide-react";
import { DEFAULT_BAUD_RATES, SUPPORTED_ADAPTERS } from "@/lib/obd/capabilities";
import type { ConnectionState, PlatformSupport, TransportKind } from "@/lib/obd/types";
import type { SafetyLevel } from "@/lib/obd/safety";

interface ConnectionPanelProps {
  connectionState: ConnectionState;
  transportKind: TransportKind;
  platform: PlatformSupport | null;
  adapterLabel?: string;
  baudRate: number;
  safetyLevel: SafetyLevel;
  labModeConfirmed: boolean;
  error: string | null;
  logs: string[];
  onTransportChange: (kind: TransportKind) => void;
  onBaudRateChange: (rate: number) => void;
  onSafetyLevelChange: (level: SafetyLevel) => void;
  onLabModeConfirm: (confirmed: boolean) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefreshDiagnostics: () => void;
  onClearLogs: () => void;
}

export function ConnectionPanel({
  connectionState,
  transportKind,
  platform,
  adapterLabel,
  baudRate,
  safetyLevel,
  labModeConfirmed,
  error,
  logs,
  onTransportChange,
  onBaudRateChange,
  onSafetyLevelChange,
  onLabModeConfirm,
  onConnect,
  onDisconnect,
  onRefreshDiagnostics,
  onClearLogs,
}: ConnectionPanelProps) {
  const connected = connectionState === "connected";
  const connecting = connectionState === "connecting";

  const transportOptions: { kind: TransportKind; label: string; disabled?: boolean }[] = [
    { kind: "simulator", label: "Simulator (demo)" },
    {
      kind: "web-serial",
      label: "USB / Web Serial",
      disabled: platform ? !platform.webSerial && !platform.isDesktop : false,
    },
    {
      kind: "webusb",
      label: "WebUSB fallback",
      disabled: platform ? !platform.webUsb : false,
    },
  ];

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-lg">Connection</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            connected
              ? "bg-green-100 text-green-800"
              : connectionState === "error"
                ? "bg-red-100 text-red-800"
                : "bg-stone-100 text-stone-600"
          }`}
        >
          {connectionState}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-stone-600">Transport</span>
          <select
            data-testid="obd-transport-select"
            value={transportKind}
            disabled={connected}
            onChange={(e) => onTransportChange(e.target.value as TransportKind)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          >
            {transportOptions.map((o) => (
              <option key={o.kind} value={o.kind} disabled={o.disabled}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        {transportKind === "web-serial" && (
          <label className="block text-sm">
            <span className="text-stone-600">Baud rate</span>
            <select
              value={baudRate}
              disabled={connected}
              onChange={(e) => onBaudRateChange(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              {DEFAULT_BAUD_RATES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="rounded-lg border border-stone-100 bg-stone-50 p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <Shield className="h-4 w-4" />
          Safety mode
        </div>
        <select
          value={safetyLevel}
          disabled={connected}
          onChange={(e) => onSafetyLevelChange(e.target.value as SafetyLevel)}
          className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
        >
          <option value="read_only">Read-only (recommended)</option>
          <option value="diagnostics">Diagnostics (allow clear DTCs)</option>
          <option value="lab_mode">Lab mode (future ECU coding — gated)</option>
        </select>
        {safetyLevel === "lab_mode" && (
          <label className="mt-2 flex items-start gap-2 text-sm text-red-800">
            <input
              type="checkbox"
              checked={labModeConfirmed}
              onChange={(e) => onLabModeConfirm(e.target.checked)}
              className="mt-1"
            />
            <span>
              I understand ECU writes can damage modules. No verified coding commands ship in v1.
            </span>
          </label>
        )}
      </div>

      {adapterLabel && (
        <p className="text-sm text-stone-600">
          Adapter: <span className="font-medium">{adapterLabel}</span>
        </p>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {!connected ? (
          <button
            type="button"
            onClick={onConnect}
            disabled={connecting}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
          >
            <Plug className="h-4 w-4" />
            {connecting ? "Connecting…" : "Connect"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onDisconnect}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-stone-50"
            >
              <Unplug className="h-4 w-4" />
              Disconnect
            </button>
            <button
              type="button"
              onClick={onRefreshDiagnostics}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-stone-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh diagnostics
            </button>
          </>
        )}
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-stone-600">Supported adapters & comm log</summary>
        <ul className="mt-2 list-disc pl-5 text-stone-600 space-y-1">
          {SUPPORTED_ADAPTERS.map((a) => (
            <li key={a.id}><strong>{a.name}</strong> — {a.notes}</li>
          ))}
        </ul>
        <div className="mt-3 max-h-40 overflow-y-auto rounded border bg-stone-900 p-2 font-mono text-xs text-green-400">
          {logs.length === 0 ? <span className="text-stone-500">No log entries yet.</span> : logs.map((l, i) => <div key={i}>{l}</div>)}
        </div>
        <button type="button" onClick={onClearLogs} className="mt-2 text-xs text-stone-500 hover:text-amber-700">
          Clear log
        </button>
      </details>
    </section>
  );
}
