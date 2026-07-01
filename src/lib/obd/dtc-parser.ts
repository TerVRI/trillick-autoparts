import type { DtcRecord, ReadinessMonitor } from "./types";

/** Parse Mode 03 / 07 DTC response bytes into codes like P0301 */
export function parseDtcBytes(bytes: number[]): string[] {
  const codes: string[] = [];
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    const a = bytes[i];
    const b = bytes[i + 1];
    if (a === 0 && b === 0) continue;
    const firstChar = ["P", "C", "B", "U"][(a >> 6) & 0x03];
    const digit1 = ((a >> 4) & 0x03).toString();
    const digit2 = (a & 0x0f).toString(16).toUpperCase();
    const digit3 = ((b >> 4) & 0x0f).toString(16).toUpperCase();
    const digit4 = (b & 0x0f).toString(16).toUpperCase();
    codes.push(`${firstChar}${digit1}${digit2}${digit3}${digit4}`);
  }
  return codes;
}

export function parseDtcResponse(raw: string, type: "stored" | "pending"): DtcRecord[] {
  const lines = raw.replace(/\r/g, "\n").split("\n").map((l) => l.trim()).filter(Boolean);
  const bytes: number[] = [];
  for (const line of lines) {
    if (line.startsWith("NO DATA") || line.startsWith("?")) continue;
    const parts = line.replace(/\s+/g, " ").split(" ").filter((p) => /^[0-9A-F]{2}$/i.test(p));
    if (parts.length >= 2) {
      const mode = parts[0].toUpperCase();
      if (mode === "43" || mode === "47") {
        const payload = parts.slice(1).map((h) => parseInt(h, 16));
        // First byte is DTC byte count; remaining bytes are code pairs
        const dtcBytes = payload.length > 1 ? payload.slice(1) : payload;
        bytes.push(...dtcBytes);
      }
    }
  }
  return parseDtcBytes(bytes).map((code) => ({ code, type }));
}

const READINESS_LABELS: Record<number, string> = {
  0: "Misfire",
  1: "Fuel System",
  2: "Components",
  3: "Catalyst",
  4: "Heated Catalyst",
  5: "Evaporative System",
  6: "Secondary Air",
  7: "A/C Refrigerant",
  8: "Oxygen Sensor",
  9: "Oxygen Sensor Heater",
  10: "EGR/VVT System",
};

export function parseReadiness(raw: string): ReadinessMonitor[] {
  const lines = raw.replace(/\r/g, "\n").split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const parts = line.replace(/\s+/g, " ").split(" ").filter((p) => /^[0-9A-F]{2}$/i.test(p));
    if (parts.length >= 6 && parts[0].toUpperCase() === "41") {
      const b = parts.slice(2).map((h) => parseInt(h, 16));
      if (b.length < 4) continue;
      const supported = b[1];
      const complete = b[2];
      const monitors: ReadinessMonitor[] = [];
      for (let i = 0; i < 11; i++) {
        const bit = 1 << i;
        monitors.push({
          id: String(i),
          label: READINESS_LABELS[i] ?? `Monitor ${i}`,
          status: !(supported & bit)
            ? "not_supported"
            : complete & bit
              ? "complete"
              : "incomplete",
        });
      }
      return monitors;
    }
  }
  return [];
}

/** Parse Mode 09 VIN (PID 02) multi-frame response */
export function parseVinResponse(raw: string): string | null {
  const lines = raw.replace(/\r/g, "\n").split("\n").map((l) => l.trim()).filter(Boolean);
  const chars: string[] = [];
  for (const line of lines) {
    const parts = line.replace(/\s+/g, " ").split(" ").filter((p) => /^[0-9A-F]{2}$/i.test(p));
    if (parts.length < 4) continue;
    const mode = parts[0].toUpperCase();
    if (mode.startsWith("49")) {
      const dataStart = mode === "4902" ? 3 : 1;
      for (let i = dataStart; i < parts.length; i++) {
        const code = parseInt(parts[i], 16);
        if (code >= 32 && code <= 126) chars.push(String.fromCharCode(code));
      }
    }
  }
  const vin = chars.join("").replace(/[^A-HJ-NPR-Z0-9]/gi, "").slice(0, 17);
  return vin.length === 17 ? vin.toUpperCase() : vin.length > 0 ? vin.toUpperCase() : null;
}
