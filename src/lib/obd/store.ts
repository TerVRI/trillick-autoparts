"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MVP_PIDS, POLL_INTERVAL_MS } from "./capabilities";
import { Elm327Client, createTransport } from "./transport";
import { detectPlatformSupport } from "./transport/platform";
import { snapshotFromPids } from "./pids";
import { buildInsights } from "./insights";
import {
  appendSample,
  createSession,
  finalizeSession,
  saveSession,
} from "./session-recorder";
import { createVehicleProfile } from "./vehicle-profile";
import { DEFAULT_SAFETY_CONFIG, type SafetyGateConfig, type SafetyLevel } from "./safety";
import type {
  AdapterInfo,
  ConnectionState,
  DiagnosticSnapshot,
  InsightSummary,
  LivePidValue,
  ObdSession,
  PlatformSupport,
  TransportKind,
  VehicleProfile,
  VehicleSnapshot,
} from "./types";

interface ObdState {
  connectionState: ConnectionState;
  transportKind: TransportKind;
  adapter: AdapterInfo | null;
  platform: PlatformSupport | null;
  pids: Record<string, LivePidValue>;
  snapshot: VehicleSnapshot | null;
  previousSnapshot: VehicleSnapshot | null;
  diagnostics: DiagnosticSnapshot;
  insights: InsightSummary | null;
  logs: string[];
  error: string | null;
  recording: boolean;
  currentSession: ObdSession | null;
  sessions: ObdSession[];
  profiles: VehicleProfile[];
  activeProfileId: string | null;
  safetyConfig: SafetyGateConfig;
  baudRate: number;
  initPlatform: () => void;
  setTransportKind: (kind: TransportKind) => void;
  setBaudRate: (rate: number) => void;
  setSafetyLevel: (level: SafetyLevel) => void;
  confirmLabMode: (confirmed: boolean) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshDiagnostics: () => Promise<void>;
  startRecording: () => void;
  stopRecording: () => void;
  addProfile: (partial?: Partial<VehicleProfile>) => void;
  updateProfile: (profile: VehicleProfile) => void;
  setActiveProfile: (id: string | null) => void;
  activeProfile: () => VehicleProfile | null;
  clearLogs: () => void;
}

let clientRef: Elm327Client | null = null;
let transportRef: ReturnType<typeof createTransport> | null = null;
let pollTimerRef: ReturnType<typeof setInterval> | null = null;

export const useObdStore = create<ObdState>()(
  persist(
    (set, get) => ({
      connectionState: "disconnected",
      transportKind: "simulator",
      adapter: null,
      platform: null,
      pids: {},
      snapshot: null,
      previousSnapshot: null,
      diagnostics: { vin: null, dtcs: [], readiness: [], adapter: null },
      insights: null,
      logs: [],
      error: null,
      recording: false,
      currentSession: null,
      sessions: [],
      profiles: [],
      activeProfileId: null,
      safetyConfig: DEFAULT_SAFETY_CONFIG,
      baudRate: 38400,

      initPlatform: () => {
        const platform = detectPlatformSupport();
        const kind = platform.recommendedTransport ?? "simulator";
        set({ platform, transportKind: kind });
        if (get().profiles.length === 0) {
          const profile = createVehicleProfile();
          set({ profiles: [profile], activeProfileId: profile.id });
        }
      },

      setTransportKind: (kind) => set({ transportKind: kind }),
      setBaudRate: (rate) => set({ baudRate: rate }),
      setSafetyLevel: (level) =>
        set({ safetyConfig: { ...get().safetyConfig, level, labModeConfirmed: level === "lab_mode" ? get().safetyConfig.labModeConfirmed : false } }),
      confirmLabMode: (confirmed) =>
        set({ safetyConfig: { ...get().safetyConfig, labModeConfirmed: confirmed } }),

      connect: async () => {
        const { transportKind, baudRate, safetyConfig } = get();
        set({ connectionState: "connecting", error: null });
        try {
          stopPolling();
          if (transportRef) await transportRef.disconnect().catch(() => {});

          const onLog = (msg: string) =>
            set((s) => ({ logs: [...s.logs.slice(-200), msg] }));

          transportRef = createTransport(transportKind, {
            baudRate,
            safetyConfig,
            onLog,
          });
          if ("setSafetyConfig" in transportRef) {
            (transportRef as { setSafetyConfig: (c: SafetyGateConfig) => void }).setSafetyConfig(safetyConfig);
          }
          await transportRef.connect();
          clientRef = new Elm327Client(transportRef, onLog);
          const adapter = await clientRef.initialize();
          set({ adapter, connectionState: "connected" });

          await get().refreshDiagnostics();
          startPolling(get, set);
        } catch (e) {
          const message = e instanceof Error ? e.message : "Connection failed";
          set({ connectionState: "error", error: message });
        }
      },

      disconnect: async () => {
        stopPolling();
        if (transportRef) await transportRef.disconnect().catch(() => {});
        transportRef = null;
        clientRef = null;
        if (get().recording) get().stopRecording();
        set({
          connectionState: "disconnected",
          adapter: null,
          pids: {},
          snapshot: null,
        });
      },

      refreshDiagnostics: async () => {
        if (!clientRef) return;
        const diagnostics = await clientRef.readDiagnostics();
        const profile = get().activeProfile();
        if (diagnostics.vin && profile) {
          get().updateProfile({ ...profile, vin: diagnostics.vin });
        }
        const snapshot = get().snapshot;
        const insights = snapshot
          ? buildInsights(snapshot, diagnostics, profile, get().previousSnapshot)
          : buildInsights(emptySnapshot(), diagnostics, profile);
        set({ diagnostics, insights });
      },

      startRecording: () => {
        const session = createSession(get().transportKind, get().activeProfileId ?? undefined);
        set({ recording: true, currentSession: session });
      },

      stopRecording: () => {
        const { currentSession, sessions } = get();
        if (currentSession) {
          const finalized = finalizeSession(currentSession);
          saveSession(finalized);
          set({
            recording: false,
            currentSession: null,
            sessions: [finalized, ...sessions].slice(0, 20),
          });
        } else {
          set({ recording: false });
        }
      },

      addProfile: (partial) => {
        const profile = createVehicleProfile(partial);
        set((s) => ({
          profiles: [...s.profiles, profile],
          activeProfileId: profile.id,
        }));
      },

      updateProfile: (profile) => {
        set((s) => ({
          profiles: s.profiles.map((p) => (p.id === profile.id ? { ...profile, updatedAt: new Date().toISOString() } : p)),
        }));
      },

      setActiveProfile: (id) => set({ activeProfileId: id }),

      activeProfile: () => {
        const { profiles, activeProfileId } = get();
        return profiles.find((p) => p.id === activeProfileId) ?? null;
      },

      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: "trillick-obd",
      partialize: (s) => ({
        transportKind: s.transportKind,
        baudRate: s.baudRate,
        profiles: s.profiles,
        activeProfileId: s.activeProfileId,
        safetyConfig: { ...s.safetyConfig, labModeConfirmed: false },
        sessions: s.sessions,
      }),
    },
  ),
);

function emptySnapshot(): VehicleSnapshot {
  return {
    timestamp: Date.now(),
    rpm: null,
    speedKph: null,
    coolantC: null,
    intakeTempC: null,
    throttlePct: null,
    engineLoadPct: null,
    fuelTrimPct: null,
    mafGps: null,
    mapKpa: null,
    voltage: null,
  };
}

function stopPolling() {
  if (pollTimerRef) {
    clearInterval(pollTimerRef);
    pollTimerRef = null;
  }
}

function startPolling(get: () => ObdState, set: (partial: Partial<ObdState> | ((s: ObdState) => Partial<ObdState>)) => void) {
  stopPolling();
  pollTimerRef = setInterval(async () => {
    if (!clientRef || get().connectionState !== "connected") return;
    try {
      const results: Record<string, LivePidValue> = {};
      for (const def of MVP_PIDS) {
        const value = await clientRef.readPid(def.pid);
        results[def.pid] = value;
      }
      const snapshot = snapshotFromPids(results);
      const prev = get().snapshot;
      const diagnostics = get().diagnostics;
      const profile = get().activeProfile();
      const insights = buildInsights(snapshot, diagnostics, profile, prev);

      let currentSession = get().currentSession;
      if (get().recording && currentSession) {
        currentSession = appendSample(
          currentSession,
          snapshot,
          diagnostics.dtcs.map((d) => d.code),
        );
      }

      set({
        pids: results,
        previousSnapshot: prev,
        snapshot,
        insights,
        currentSession: currentSession ?? get().currentSession,
      });
    } catch {
      // Individual PID failures are non-fatal during polling
    }
  }, POLL_INTERVAL_MS);
}
