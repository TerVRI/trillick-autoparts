"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Circle, Download, Square } from "lucide-react";
import { useObdStore } from "@/lib/obd/store";
import { downloadCsv } from "@/lib/obd/session-recorder";
import { ConnectionPanel } from "./ConnectionPanel";
import { GaugesPanel } from "./GaugesPanel";
import { DiagnosticsPanel } from "./DiagnosticsPanel";
import { ConfiguratorPanel } from "./ConfiguratorPanel";
import { InsightsPanel } from "./InsightsPanel";
import { PlatformBanner } from "./PlatformBanner";

type Tab = "dashboard" | "diagnostics" | "profile" | "sessions";

export function ObdDashboard() {
  const [tab, setTab] = useState<Tab>("dashboard");

  const {
    connectionState,
    transportKind,
    platform,
    adapter,
    pids,
    diagnostics,
    insights,
    logs,
    error,
    recording,
    currentSession,
    sessions,
    profiles,
    activeProfileId,
    safetyConfig,
    baudRate,
    initPlatform,
    setTransportKind,
    setBaudRate,
    setSafetyLevel,
    confirmLabMode,
    connect,
    disconnect,
    refreshDiagnostics,
    startRecording,
    stopRecording,
    addProfile,
    updateProfile,
    setActiveProfile,
    clearLogs,
  } = useObdStore();

  useEffect(() => {
    initPlatform();
  }, [initPlatform]);

  const connected = connectionState === "connected";

  function removeProfile(id: string) {
    const next = profiles.filter((p) => p.id !== id);
    useObdStore.setState({
      profiles: next,
      activeProfileId: next[0]?.id ?? null,
    });
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "diagnostics", label: "Diagnostics" },
    { id: "profile", label: "Car profile" },
    { id: "sessions", label: "Sessions" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/tools" className="mb-6 inline-flex items-center gap-1 text-sm text-stone-600 hover:text-amber-700">
        <ArrowLeft className="h-4 w-4" /> Back to Tools
      </Link>

      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold uppercase text-stone-900 md:text-4xl">
          OBD Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-stone-600">
          Connect an ELM327 USB adapter via Web Serial, or use Simulator mode. Read live gauges, fault codes, and build your vehicle profile — all in the browser, no account required.
        </p>
      </header>

      <PlatformBanner platform={platform} />

      <div className="mt-6 flex flex-wrap gap-2 border-b border-stone-200 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === t.id ? "bg-amber-600 text-white" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-6">
        <ConnectionPanel
          connectionState={connectionState}
          transportKind={transportKind}
          platform={platform}
          adapterLabel={adapter?.label}
          baudRate={baudRate}
          safetyLevel={safetyConfig.level}
          labModeConfirmed={safetyConfig.labModeConfirmed}
          error={error}
          logs={logs}
          onTransportChange={setTransportKind}
          onBaudRateChange={setBaudRate}
          onSafetyLevelChange={setSafetyLevel}
          onLabModeConfirm={confirmLabMode}
          onConnect={connect}
          onDisconnect={disconnect}
          onRefreshDiagnostics={refreshDiagnostics}
          onClearLogs={clearLogs}
        />

        {tab === "dashboard" && (
          <>
            <InsightsPanel insights={insights} />
            <GaugesPanel pids={pids} connected={connected} />
            <div className="flex flex-wrap gap-2">
              {!recording ? (
                <button
                  type="button"
                  disabled={!connected}
                  onClick={startRecording}
                  className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-stone-50 disabled:opacity-50"
                >
                  <Circle className="h-4 w-4 text-red-500 fill-red-500" />
                  Record session
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
                >
                  <Square className="h-4 w-4" />
                  Stop ({currentSession?.samples.length ?? 0} samples)
                </button>
              )}
            </div>
          </>
        )}

        {tab === "diagnostics" && <DiagnosticsPanel diagnostics={diagnostics} />}

        {tab === "profile" && (
          <ConfiguratorPanel
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSelectProfile={setActiveProfile}
            onAddProfile={() => addProfile()}
            onUpdateProfile={updateProfile}
            onRemoveProfile={removeProfile}
          />
        )}

        {tab === "sessions" && (
          <section className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="font-semibold text-lg">Recorded sessions</h2>
            <p className="mt-1 text-sm text-stone-500">Stored locally in your browser. Export CSV for analysis.</p>
            {sessions.length === 0 ? (
              <p className="mt-4 text-sm text-stone-500">No sessions yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {sessions.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
                    <span>
                      {new Date(s.startedAt).toLocaleString()} · {s.samples.length} samples · {s.transport}
                    </span>
                    <button
                      type="button"
                      onClick={() => downloadCsv(s)}
                      className="inline-flex items-center gap-1 text-amber-700 hover:underline"
                    >
                      <Download className="h-4 w-4" />
                      CSV
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
