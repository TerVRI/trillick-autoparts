import { describe, expect, it } from "vitest";
import { decodeStandardDtc, decodeBmwDtc, parseDtcPayload } from "./dtc";

describe("bmw dtc", () => {
  it("decodes standard 2-byte DTC", () => {
    expect(decodeStandardDtc(0x01, 0x71)).toBe("P0171");
    expect(decodeStandardDtc(0x04, 0x20)).toBe("P0420");
  });

  it("decodes status byte flags", () => {
    const dtc = decodeBmwDtc(0x01, 0x00, 0x2f);
    expect(dtc.status.present).toBe(true);
    expect(dtc.statusByte).toBe(0x2f);
  });

  it("parses UDS 4-byte DTC records", () => {
    // [mask] then [hi][mid][lo][status] * 2
    const payload = [0xff, 0x01, 0x00, 0x00, 0x2f, 0x04, 0x20, 0x00, 0x28];
    const dtcs = parseDtcPayload(payload);
    expect(dtcs.length).toBe(2);
    expect(dtcs[0].code).toBe("P0100");
  });

  it("parses KWP 3-byte triplets", () => {
    const payload = [0x01, 0x71, 0x2f, 0x04, 0x20, 0x28];
    const dtcs = parseDtcPayload(payload);
    expect(dtcs.length).toBe(2);
  });
});
