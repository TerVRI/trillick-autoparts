"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plug, Unplug, Search, ShieldAlert, AlertTriangle } from "lucide-react";
import { BmwClient } from "@/lib/bmw/client";
import { createBmwTransport } from "@/lib/bmw/transport";
import { DEFAULT_BMW_SAFETY, type BmwSafetyConfig, type BmwSafetyLevel } from "@/lib/bmw/safety";
import { findEcu } from "@/lib/bmw/ecus";
import { formatDtcRaw } from "@/lib/bmw/dtc";
import type { BmwBus, BmwConnectionState, BmwDtc, BmwTransportKind, EcuScanResult } from "@/lib/bmw/types";

export function BmwInpaDashboard() {
  const [transportKind, setTransportKind] = useState<BmwTransportKind>("simulator");
  const [bus, setBus] = useState<BmwBus>("d-can");
  const [safety, setSafety] = useState<BmwSafetyConfig>(DEFAULT_BMW_SAFETY);
  const [state, setState] = useState<BmwConnectionState>("disconnected");
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<EcuScanResult[]>([]);
  const [selectedEcu, setSelectedEcu] = useState<string | null>(null);
  const [faults, setFaults] = useState<BmwDtc[]>([]);
  const [scanning, setScanning] = useState(false);

  const clientRef = useMemo(() => ({ current: null as BmwClient | null, transport: null as ReturnType<typeof createBmwTransport> | null }), []);

  const log = (m: string) => setLogs((l) => [...l.slice(-150), m]);

  async function connect() {
    setState("connecting");
    setError(null);
    try {
      const transport = createBmwTransport(transportKind, { bus, safetyConfig: safety, onLog: log });
      if ("setSafetyConfig" in transport) {
        (transport as { setSafetyConfig: (c: BmwSafetyConfig) => void }).setSafetyConfig(safety);
      }
      await transport.connect();
      clientRef.transport = transport;
      clientRef.current = new BmwClient(transport, log);
      setState("connected");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed");
      setState("error");
    }
  }

  async function disconnect() {
    await clientRef.transport?.disconnect().catch(() => {});
    clientRef.current = null;
    clientRef.transport = null;
    setState("disconnected");
    setResults([]);
    setFaults([]);
    setSelectedEcu(null);
  }

  async function scan() {
    if (!clientRef.current) return;
    setScanning(true);
    try {
      const r = await clientRef.current.scanAll();
      setResults(r);
    } finally {
      setScanning(false);
    }
  }

  async function readFaults(code: string) {
    if (!clientRef.current) return;
    const ecu = findEcu(code);
    if (!ecu) return;
    setSelectedEcu(code);
    const f = await clientRef.current.readFaults(ecu);
    setFaults(f);
  }

  const connected = state === "connected";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/tools" className="mb-6 inline-flex items-center gap-1 text-sm text-stone-600 hover:text-amber-700">
        <ArrowLeft className="h-4 w-4" /> Back to Tools
      </Link>

      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold uppercase text-stone-900 md:text-4xl">BMW Diagnostics (INPA-style)</h1>
        <p className="mt-2 max-w-2xl text-stone-600">
          Read-only module scanning, identification, and fault codes for BMW E-series over a K+DCAN cable via Web Serial.
          An independent implementation of public protocols (KWP2000 / UDS) — not BMW INPA/Ediabas.
        </p>
      </header>

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Set the cable switch to match your car: <strong>K-Line</strong> (pins 7+8 bridged) for pre-03/2007,
          <strong> D-CAN</strong> (pins 7+8 separate) for 03/2007+. Coding/flashing is disabled — reads only.
        </span>
      </div>

      <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm">
            <span className="text-stone-600">Interface</span>
            <select
              data-testid="bmw-transport-select"
              value={transportKind}
              disabled={connected}
              onChange={(e) => setTransportKind(e.target.value as BmwTransportKind)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option value="simulator">Simulator (demo)</option>
              <option value="kdcan-web-serial">K+DCAN cable (Web Serial)</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="text-stone-600">Bus</span>
            <select
              value={bus}
              disabled={connected}
              onChange={(e) => setBus(e.target.value as BmwBus)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option value="d-can">D-CAN (2007+)</option>
              <option value="k-line">K-Line (pre-2007)</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="text-stone-600">Safety mode</span>
            <select
              value={safety.level}
              disabled={connected}
              onChange={(e) => setSafety({ ...safety, level: e.target.value as BmwSafetyLevel, codingConfirmed: false })}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option value="read_only">Read-only (recommended)</option>
              <option value="clear_faults">Allow clear faults</option>
              <option value="coding">Coding (gated)</option>
            </select>
          </label>
        </div>

        {safety.level === "coding" && (
          <label className="flex items-start gap-2 text-sm text-red-800">
            <input
              type="checkbox"
              checked={safety.codingConfirmed}
              onChange={(e) => setSafety({ ...safety, codingConfirmed: e.target.checked })}
              className="mt-1"
            />
            <span>I understand coding/flashing can permanently damage modules. No verified coding routines ship here.</span>
          </label>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {!connected ? (
            <button type="button" onClick={connect} className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500">
              <Plug className="h-4 w-4" /> {state === "connecting" ? "Connecting…" : "Connect"}
            </button>
          ) : (
            <>
              <button type="button" onClick={disconnect} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-stone-50">
                <Unplug className="h-4 w-4" /> Disconnect
              </button>
              <button type="button" onClick={scan} disabled={scanning} className="inline-flex items-center gap-2 rounded-lg bg-stone-800 px-4 py-2 text-sm text-white disabled:opacity-50">
                <Search className="h-4 w-4" /> {scanning ? "Scanning…" : "Scan modules"}
              </button>
            </>
          )}
          <span className={`self-center rounded-full px-3 py-1 text-xs font-medium ${connected ? "bg-green-100 text-green-800" : state === "error" ? "bg-red-100 text-red-800" : "bg-stone-100 text-stone-600"}`}>
            {state}
          </span>
        </div>
      </section>

      {results.length > 0 && (
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="font-semibold text-lg">Control units</h2>
            <ul className="mt-3 space-y-2">
              {results.map((r) => (
                <li key={r.ecu.code}>
                  <button
                    type="button"
                    onClick={() => readFaults(r.ecu.code)}
                    className={`w-full rounded-lg border p-3 text-left text-sm transition hover:border-amber-400 ${selectedEcu === r.ecu.code ? "border-amber-500 bg-amber-50" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{r.ecu.code} — {r.ecu.name}</span>
                      <span className={r.reachable ? "text-green-700" : "text-stone-400"}>
                        {r.reachable ? "online" : "no response"}
                      </span>
                    </div>
                    {r.identification?.vin && <p className="mt-1 font-mono text-xs text-stone-500">VIN {r.identification.vin}</p>}
                    <p className="mt-1 text-xs text-stone-500">{r.faultCount ?? 0} fault(s)</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="font-semibold text-lg">Fault memory {selectedEcu ? `— ${selectedEcu}` : ""}</h2>
            {!selectedEcu ? (
              <p className="mt-3 text-sm text-stone-500">Select a control unit to read its fault memory.</p>
            ) : faults.length === 0 ? (
              <p className="mt-3 text-sm text-green-700">No faults stored.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {faults.map((f) => (
                  <li key={`${f.raw}-${f.statusByte ?? 0}`} className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold">{f.code}</span>
                      <span className="font-mono text-xs text-stone-500">{formatDtcRaw(f)}</span>
                    </div>
                    <p className="mt-1 text-xs text-stone-600">
                      {f.status.present ? "present" : "not present"}
                      {f.status.stored ? " · stored" : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      <details className="mt-6 text-sm">
        <summary className="cursor-pointer text-stone-600">Communication log</summary>
        <div className="mt-2 max-h-56 overflow-y-auto rounded border bg-stone-900 p-2 font-mono text-xs text-green-400">
          {logs.length === 0 ? <span className="text-stone-500">No log entries yet.</span> : logs.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </details>
    </div>
  );
}
