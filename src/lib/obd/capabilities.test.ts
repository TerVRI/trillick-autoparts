import { describe, expect, it } from "vitest";
import { MVP_PIDS, MVP_READ_MODES, SUPPORTED_ADAPTERS } from "./capabilities";

describe("capabilities", () => {
  it("defines MVP PIDs for live dashboard", () => {
    expect(MVP_PIDS.length).toBeGreaterThanOrEqual(8);
    expect(MVP_PIDS.map((p) => p.pid)).toContain("0C");
    expect(MVP_PIDS.map((p) => p.pid)).toContain("0D");
  });

  it("limits v1 to read-only OBD modes", () => {
    expect(MVP_READ_MODES).toContain("01");
    expect(MVP_READ_MODES).toContain("03");
    expect(MVP_READ_MODES).not.toContain("04");
  });

  it("documents supported adapter families", () => {
    expect(SUPPORTED_ADAPTERS.length).toBeGreaterThan(0);
    expect(SUPPORTED_ADAPTERS[0].transports.length).toBeGreaterThan(0);
  });
});
