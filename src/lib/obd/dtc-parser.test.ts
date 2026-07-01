import { describe, expect, it } from "vitest";
import {
  parseDtcBytes,
  parseDtcResponse,
  parseReadiness,
  parseVinResponse,
} from "./dtc-parser";

describe("dtc-parser", () => {
  it("decodes DTC bytes to P-codes", () => {
    // P0301 = 0x03 0x01
    expect(parseDtcBytes([0x03, 0x01])).toEqual(["P0301"]);
  });

  it("parses stored DTC response", () => {
    const raw = "43 02 03 01 00 00\r\r>";
    const dtcs = parseDtcResponse(raw, "stored");
    expect(dtcs).toHaveLength(1);
    expect(dtcs[0].code).toBe("P0301");
    expect(dtcs[0].type).toBe("stored");
  });

  it("parses pending DTC response", () => {
    const raw = "47 02 04 20 00 00\r\r>";
    const dtcs = parseDtcResponse(raw, "pending");
    expect(dtcs[0].type).toBe("pending");
    expect(dtcs[0].code).toBe("P0420");
  });

  it("parses readiness monitors", () => {
    const raw = "41 01 81 07 65 04\r\r>";
    const monitors = parseReadiness(raw);
    expect(monitors.length).toBe(11);
    expect(monitors[0].label).toBe("Misfire");
    expect(monitors.some((m) => m.status === "complete" || m.status === "incomplete")).toBe(true);
  });

  it("extracts VIN from mode 09 response", () => {
    const raw = "49 02 01 53 41 4C 47 42 4B 32 46 45 31 4D 45 30 31 32 33 34 35\r\r>";
    const vin = parseVinResponse(raw);
    expect(vin).toBe("SALGBK2FE1ME012345".slice(0, 17));
    expect(vin?.length).toBe(17);
  });
});
