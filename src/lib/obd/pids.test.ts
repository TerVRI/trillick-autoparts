import { describe, expect, it } from "vitest";
import { decodePid, parseObdResponse, snapshotFromPids, PID_DEFINITIONS } from "./pids";

describe("pids", () => {
  it("parses ELM327 hex response for RPM", () => {
    const bytes = parseObdResponse("41 0C 1A F8\r\r>", "0C");
    expect(bytes).toEqual([0x1a, 0xf8]);
    const decoded = decodePid("0C", bytes);
    expect(decoded.value).toBeCloseTo(1726, 0);
    expect(decoded.supported).toBe(true);
  });

  it("parses coolant temperature PID", () => {
    const bytes = parseObdResponse("41 05 78\r\r>", "05");
    expect(PID_DEFINITIONS["05"].decode(bytes!)).toBe(80);
  });

  it("returns null for NO DATA responses", () => {
    expect(parseObdResponse("NO DATA\r\r>", "0C")).toBeNull();
    const decoded = decodePid("0C", null);
    expect(decoded.value).toBeNull();
    expect(decoded.supported).toBe(false);
  });

  it("builds vehicle snapshot from PID map", () => {
    const now = Date.now();
    const snapshot = snapshotFromPids({
      "0C": { pid: "0C", label: "RPM", unit: "rpm", value: 800, supported: true, updatedAt: now },
      "0D": { pid: "0D", label: "Speed", unit: "km/h", value: 60, supported: true, updatedAt: now },
      "05": { pid: "05", label: "Coolant", unit: "°C", value: 90, supported: true, updatedAt: now },
    });
    expect(snapshot.rpm).toBe(800);
    expect(snapshot.speedKph).toBe(60);
    expect(snapshot.coolantC).toBe(90);
  });
});
