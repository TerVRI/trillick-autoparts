import { describe, expect, it } from "vitest";
import { buildInsights } from "./insights";
import { createVehicleProfile } from "./vehicle-profile";
import type { DiagnosticSnapshot, VehicleSnapshot } from "./types";

const baseSnapshot = (overrides: Partial<VehicleSnapshot> = {}): VehicleSnapshot => ({
  timestamp: Date.now(),
  rpm: 750,
  speedKph: 0,
  coolantC: 90,
  intakeTempC: 25,
  throttlePct: 12,
  engineLoadPct: 22,
  fuelTrimPct: 2,
  mafGps: 4.5,
  mapKpa: 95,
  voltage: 13.8,
  ...overrides,
});

const emptyDiagnostics = (): DiagnosticSnapshot => ({
  vin: null,
  dtcs: [],
  readiness: [],
  adapter: null,
});

describe("insights", () => {
  it("reports healthy vehicle with no codes", () => {
    const result = buildInsights(baseSnapshot(), emptyDiagnostics(), null);
    expect(result.overall).toBe("good");
    expect(result.bullets.some((b) => b.includes("No stored fault"))).toBe(true);
  });

  it("flags stored DTCs as attention or critical", () => {
    const diagnostics: DiagnosticSnapshot = {
      ...emptyDiagnostics(),
      dtcs: [
        { code: "P0420", type: "stored" },
        { code: "P0171", type: "stored" },
      ],
    };
    const result = buildInsights(baseSnapshot(), diagnostics, null);
    expect(result.overall).toBe("critical");
    expect(result.bullets.some((b) => b.includes("P0420"))).toBe(true);
  });

  it("detects overheating coolant", () => {
    const profile = createVehicleProfile({ fuelType: "diesel" });
    const result = buildInsights(
      baseSnapshot({ coolantC: 105 }),
      emptyDiagnostics(),
      profile,
    );
    expect(result.overall).toBe("critical");
    expect(result.anomalies.some((a) => a.includes("running hot"))).toBe(true);
  });

  it("detects low voltage", () => {
    const profile = createVehicleProfile();
    const result = buildInsights(
      baseSnapshot({ voltage: 11.5 }),
      emptyDiagnostics(),
      profile,
    );
    expect(result.anomalies.some((a) => a.includes("Voltage"))).toBe(true);
  });
});
