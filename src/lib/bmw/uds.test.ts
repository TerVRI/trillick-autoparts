import { describe, expect, it } from "vitest";
import {
  parseUdsResponse,
  readDataByIdentifier,
  readDtcByStatusMask,
  serviceName,
  UDS_SERVICE,
} from "./uds";

describe("uds", () => {
  it("builds read-data-by-identifier request", () => {
    expect(readDataByIdentifier(0xf190)).toEqual([0x22, 0xf1, 0x90]);
  });

  it("builds read-DTC request", () => {
    expect(readDtcByStatusMask(0xff)).toEqual([0x19, 0x02, 0xff]);
  });

  it("parses a positive response", () => {
    const resp = parseUdsResponse([0x62, 0xf1, 0x90, 0x41]);
    expect(resp?.positive).toBe(true);
    expect(resp?.service).toBe(UDS_SERVICE.READ_DATA_BY_ID);
    expect(resp?.data).toEqual([0xf1, 0x90, 0x41]);
  });

  it("parses a negative response with NRC text", () => {
    const resp = parseUdsResponse([0x7f, 0x22, 0x31]);
    expect(resp?.positive).toBe(false);
    expect(resp?.nrc).toBe(0x31);
    expect(resp?.nrcText).toMatch(/out of range/i);
  });

  it("names services", () => {
    expect(serviceName(0x22)).toBe("READ_DATA_BY_ID");
  });
});
