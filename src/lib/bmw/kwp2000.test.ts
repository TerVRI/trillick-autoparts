import { describe, expect, it } from "vitest";
import { buildKwpFrame, checksum, extractKwpFrame, parseKwpFrame, TESTER_ADDRESS } from "./kwp2000";

describe("kwp2000", () => {
  it("computes 8-bit sum checksum", () => {
    expect(checksum([0x82, 0x12, 0xf1, 0x1a])).toBe((0x82 + 0x12 + 0xf1 + 0x1a) & 0xff);
  });

  it("builds a short frame with length in format byte", () => {
    const frame = buildKwpFrame(0x12, [0x1a, 0x80]);
    expect(frame[0]).toBe(0x82); // 0x80 | length 2
    expect(frame[1]).toBe(0x12);
    expect(frame[2]).toBe(TESTER_ADDRESS);
    expect(frame[frame.length - 1]).toBe(checksum(frame.slice(0, -1)));
  });

  it("round-trips build then parse", () => {
    const frame = buildKwpFrame(0x12, [0x1a, 0x80]);
    // Simulate ECU echoing target/source swap with same data
    const response = buildKwpFrame(TESTER_ADDRESS, [0x5a, 0x80, 0x41], 0x12);
    const parsed = parseKwpFrame(response);
    expect(parsed?.valid).toBe(true);
    expect(parsed?.data).toEqual([0x5a, 0x80, 0x41]);
    expect(frame.length).toBeGreaterThan(3);
  });

  it("detects invalid checksum", () => {
    const good = buildKwpFrame(0x12, [0x1a, 0x80]);
    const bad = [...good];
    bad[bad.length - 1] = (bad[bad.length - 1] + 1) & 0xff;
    expect(parseKwpFrame(bad)?.valid).toBe(false);
  });

  it("extracts a frame from a noisy buffer", () => {
    const frame = buildKwpFrame(TESTER_ADDRESS, [0x5a, 0x80], 0x12);
    const buffer = [0x00, 0x00, ...frame, 0x99];
    const { frame: parsed, rest } = extractKwpFrame(buffer);
    expect(parsed?.valid).toBe(true);
    expect(rest).toEqual([0x99]);
  });
});
