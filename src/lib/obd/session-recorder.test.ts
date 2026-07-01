import { describe, expect, it } from "vitest";
import {
  createSession,
  appendSample,
  finalizeSession,
  exportSessionCsv,
  exportSessionJson,
} from "./session-recorder";
import type { VehicleSnapshot } from "./types";

const sample: VehicleSnapshot = {
  timestamp: 1_700_000_000_000,
  rpm: 800,
  speedKph: 50,
  coolantC: 88,
  intakeTempC: 22,
  throttlePct: 15,
  engineLoadPct: 30,
  fuelTrimPct: 1,
  mafGps: 5,
  mapKpa: 90,
  voltage: 13.5,
};

describe("session-recorder", () => {
  it("creates and grows a session", () => {
    const session = createSession("simulator", "profile-1");
    expect(session.transport).toBe("simulator");
    expect(session.vehicleProfileId).toBe("profile-1");
    expect(session.samples).toHaveLength(0);

    const withSample = appendSample(session, sample, ["P0420"]);
    expect(withSample.samples).toHaveLength(1);
    expect(withSample.samples[0].dtcs).toEqual(["P0420"]);
  });

  it("finalizes session with end timestamp", () => {
    const session = createSession("simulator");
    const finalized = finalizeSession(session);
    expect(finalized.endedAt).toBeTruthy();
  });

  it("exports CSV with headers and data row", () => {
    const session = appendSample(createSession("simulator"), sample);
    const csv = exportSessionCsv(session);
    expect(csv.split("\n")[0]).toContain("timestamp");
    expect(csv).toContain("800");
    expect(csv).toContain("50");
  });

  it("exports JSON session", () => {
    const session = createSession("web-serial");
    const json = exportSessionJson(session);
    const parsed = JSON.parse(json);
    expect(parsed.transport).toBe("web-serial");
  });
});
