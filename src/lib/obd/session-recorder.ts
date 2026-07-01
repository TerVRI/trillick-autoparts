import type { ObdSession, SessionSample, TransportKind, VehicleSnapshot } from "./types";

const STORAGE_KEY = "trillick-obd-sessions";

export function createSession(transport: TransportKind, vehicleProfileId?: string): ObdSession {
  return {
    id: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    transport,
    vehicleProfileId,
    samples: [],
  };
}

export function appendSample(
  session: ObdSession,
  snapshot: VehicleSnapshot,
  dtcs: string[] = [],
): ObdSession {
  const sample: SessionSample = { ...snapshot, dtcs };
  return { ...session, samples: [...session.samples, sample] };
}

export function finalizeSession(session: ObdSession): ObdSession {
  return { ...session, endedAt: new Date().toISOString() };
}

export function loadSessions(): ObdSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ObdSession[]) : [];
  } catch {
    return [];
  }
}

export function saveSession(session: ObdSession): void {
  const sessions = loadSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) sessions[idx] = session;
  else sessions.unshift(session);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 20)));
}

export function exportSessionCsv(session: ObdSession): string {
  const headers = [
    "timestamp", "rpm", "speedKph", "coolantC", "intakeTempC", "throttlePct",
    "engineLoadPct", "fuelTrimPct", "mafGps", "mapKpa", "voltage", "dtcs",
  ];
  const rows = session.samples.map((s) =>
    [
      new Date(s.timestamp).toISOString(),
      s.rpm ?? "",
      s.speedKph ?? "",
      s.coolantC ?? "",
      s.intakeTempC ?? "",
      s.throttlePct ?? "",
      s.engineLoadPct ?? "",
      s.fuelTrimPct ?? "",
      s.mafGps ?? "",
      s.mapKpa ?? "",
      s.voltage ?? "",
      s.dtcs.join(";"),
    ].join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

export function downloadCsv(session: ObdSession, filename?: string) {
  const csv = exportSessionCsv(session);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `obd-session-${session.id.slice(0, 8)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSessionJson(session: ObdSession): string {
  return JSON.stringify(session, null, 2);
}
