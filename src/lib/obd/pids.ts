import type { LivePidValue } from "./types";
import { MVP_PIDS } from "./capabilities";

export interface PidDefinition {
  pid: string;
  label: string;
  unit: string;
  decode: (bytes: number[]) => number | null;
}

function byteA(bytes: number[]): number | null {
  return bytes.length >= 1 ? bytes[0] : null;
}

function bytesAB(bytes: number[]): [number, number] | null {
  if (bytes.length < 2) return null;
  return [bytes[0], bytes[1]];
}

export const PID_DEFINITIONS: Record<string, PidDefinition> = {
  "0C": {
    pid: "0C",
    label: "Engine RPM",
    unit: "rpm",
    decode: (b) => {
      const ab = bytesAB(b);
      return ab ? (ab[0] * 256 + ab[1]) / 4 : null;
    },
  },
  "0D": {
    pid: "0D",
    label: "Vehicle Speed",
    unit: "km/h",
    decode: (b) => byteA(b),
  },
  "05": {
    pid: "05",
    label: "Coolant Temp",
    unit: "°C",
    decode: (b) => {
      const a = byteA(b);
      return a !== null ? a - 40 : null;
    },
  },
  "0F": {
    pid: "0F",
    label: "Intake Air Temp",
    unit: "°C",
    decode: (b) => {
      const a = byteA(b);
      return a !== null ? a - 40 : null;
    },
  },
  "11": {
    pid: "11",
    label: "Throttle Position",
    unit: "%",
    decode: (b) => {
      const a = byteA(b);
      return a !== null ? (a * 100) / 255 : null;
    },
  },
  "04": {
    pid: "04",
    label: "Engine Load",
    unit: "%",
    decode: (b) => {
      const a = byteA(b);
      return a !== null ? (a * 100) / 255 : null;
    },
  },
  "06": {
    pid: "06",
    label: "Short Fuel Trim B1",
    unit: "%",
    decode: (b) => {
      const a = byteA(b);
      return a !== null ? (a - 128) * (100 / 128) : null;
    },
  },
  "10": {
    pid: "10",
    label: "MAF Air Flow",
    unit: "g/s",
    decode: (b) => {
      const ab = bytesAB(b);
      return ab ? (ab[0] * 256 + ab[1]) / 100 : null;
    },
  },
  "0B": {
    pid: "0B",
    label: "Intake Manifold Pressure",
    unit: "kPa",
    decode: (b) => byteA(b),
  },
  "42": {
    pid: "42",
    label: "Control Module Voltage",
    unit: "V",
    decode: (b) => {
      const ab = bytesAB(b);
      return ab ? (ab[0] * 256 + ab[1]) / 1000 : null;
    },
  },
};

export function parseObdResponse(raw: string, expectedPid: string): number[] | null {
  const cleaned = raw.replace(/\r/g, "\n").split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of cleaned) {
    if (line.startsWith("NO DATA") || line.startsWith("?") || line.startsWith("ERROR")) {
      return null;
    }
    const hex = line.replace(/\s+/g, " ").toUpperCase();
    const parts = hex.split(" ").filter((p) => /^[0-9A-F]{2}$/.test(p));
    if (parts.length < 3) continue;
    const mode = parts[0];
    const pid = parts[1];
    if ((mode === "41" || mode === "61") && pid === expectedPid.toUpperCase()) {
      return parts.slice(2).map((h) => parseInt(h, 16));
    }
  }
  return null;
}

export function decodePid(pid: string, bytes: number[] | null): LivePidValue {
  const def = PID_DEFINITIONS[pid.toUpperCase()] ?? MVP_PIDS.find((p) => p.pid === pid);
  const label = def && "label" in def ? def.label : `PID ${pid}`;
  const unit = def && "unit" in def ? def.unit : "";
  const decoder = PID_DEFINITIONS[pid.toUpperCase()];
  return {
    pid: pid.toUpperCase(),
    label,
    unit,
    value: bytes && decoder ? decoder.decode(bytes) : null,
    supported: bytes !== null,
    updatedAt: Date.now(),
  };
}

export function snapshotFromPids(pids: Record<string, LivePidValue>): import("./types").VehicleSnapshot {
  const get = (id: string) => pids[id]?.value ?? null;
  return {
    timestamp: Date.now(),
    rpm: get("0C"),
    speedKph: get("0D"),
    coolantC: get("05"),
    intakeTempC: get("0F"),
    throttlePct: get("11"),
    engineLoadPct: get("04"),
    fuelTrimPct: get("06"),
    mafGps: get("10"),
    mapKpa: get("0B"),
    voltage: get("42"),
  };
}
