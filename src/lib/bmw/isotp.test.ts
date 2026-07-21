import { describe, expect, it } from "vitest";
import { classifyIsoTp, decodeIsoTp, encodeIsoTp } from "./isotp";

describe("isotp", () => {
  it("encodes a short payload as a single frame", () => {
    const frames = encodeIsoTp([0x22, 0xf1, 0x90]);
    expect(frames).toHaveLength(1);
    expect(frames[0][0]).toBe(0x03);
    expect(frames[0]).toHaveLength(8);
  });

  it("classifies a single frame", () => {
    const f = classifyIsoTp([0x03, 0x22, 0xf1, 0x90, 0, 0, 0, 0]);
    expect(f.type).toBe("single");
    expect(f.length).toBe(3);
    expect(f.data.slice(0, 3)).toEqual([0x22, 0xf1, 0x90]);
  });

  it("encodes and decodes a multi-frame payload", () => {
    const payload = Array.from({ length: 20 }, (_, i) => i + 1);
    const frames = encodeIsoTp(payload);
    expect(frames.length).toBeGreaterThan(1);
    expect(classifyIsoTp(frames[0]).type).toBe("first");
    const decoded = decodeIsoTp(frames);
    expect(decoded).toEqual(payload);
  });

  it("decodes single-frame round trip", () => {
    const payload = [0x62, 0xf1, 0x90, 0x57, 0x42, 0x41];
    const decoded = decodeIsoTp(encodeIsoTp(payload));
    expect(decoded).toEqual(payload);
  });
});
