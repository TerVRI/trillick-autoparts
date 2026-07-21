import { describe, expect, it } from "vitest";
import {
  assertServiceAllowed,
  classifyService,
  DEFAULT_BMW_SAFETY,
  evaluateService,
} from "./safety";
import { UDS_SERVICE } from "./uds";

describe("bmw safety gate", () => {
  it("allows read services in read-only mode", () => {
    expect(evaluateService(UDS_SERVICE.READ_DTC_INFORMATION).allowed).toBe(true);
    expect(evaluateService(UDS_SERVICE.READ_DATA_BY_ID).allowed).toBe(true);
    expect(evaluateService(UDS_SERVICE.KWP_READ_ECU_ID).allowed).toBe(true);
  });

  it("blocks clear faults in read-only mode", () => {
    expect(evaluateService(UDS_SERVICE.CLEAR_DIAGNOSTIC_INFO).allowed).toBe(false);
  });

  it("allows clear faults when enabled", () => {
    const decision = evaluateService(UDS_SERVICE.CLEAR_DIAGNOSTIC_INFO, {
      level: "clear_faults",
      codingConfirmed: false,
    });
    expect(decision.allowed).toBe(true);
  });

  it("blocks coding services unless confirmed", () => {
    expect(evaluateService(UDS_SERVICE.WRITE_DATA_BY_ID).allowed).toBe(false);
    expect(evaluateService(UDS_SERVICE.SECURITY_ACCESS).allowed).toBe(false);
    const confirmed = evaluateService(UDS_SERVICE.WRITE_DATA_BY_ID, { level: "coding", codingConfirmed: true });
    expect(confirmed.allowed).toBe(true);
  });

  it("classifies services", () => {
    expect(classifyService(UDS_SERVICE.READ_DATA_BY_ID)).toBe("read");
    expect(classifyService(UDS_SERVICE.CLEAR_DIAGNOSTIC_INFO)).toBe("clear");
    expect(classifyService(UDS_SERVICE.ROUTINE_CONTROL)).toBe("coding");
  });

  it("assert throws when blocked", () => {
    expect(() => assertServiceAllowed(UDS_SERVICE.ECU_RESET, DEFAULT_BMW_SAFETY)).toThrow();
  });
});
