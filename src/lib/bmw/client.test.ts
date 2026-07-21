import { describe, expect, it } from "vitest";
import { BmwClient } from "./client";
import { BmwSimulatorTransport } from "./transport/simulator";
import { findEcu } from "./ecus";

describe("BmwClient with simulator", () => {
  it("scans modules and returns reachable ECUs", async () => {
    const transport = new BmwSimulatorTransport({ commandDelayMs: 0, bus: "d-can" });
    await transport.connect();
    const client = new BmwClient(transport);
    const results = await client.scanAll();
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.reachable)).toBe(true);
    await transport.disconnect();
  });

  it("reads faults from the engine ECU", async () => {
    const transport = new BmwSimulatorTransport({ commandDelayMs: 0, bus: "d-can" });
    await transport.connect();
    const client = new BmwClient(transport);
    const dme = findEcu("DME")!;
    const faults = await client.readFaults(dme);
    expect(faults.length).toBeGreaterThan(0);
    await transport.disconnect();
  });

  it("blocks clear faults in read-only mode", async () => {
    const transport = new BmwSimulatorTransport({ commandDelayMs: 0, bus: "d-can" });
    await transport.connect();
    const client = new BmwClient(transport);
    const dme = findEcu("DME")!;
    await expect(client.clearFaults(dme)).rejects.toThrow(/read-only|disabled/i);
    await transport.disconnect();
  });

  it("allows clear faults when safety permits", async () => {
    const transport = new BmwSimulatorTransport({
      commandDelayMs: 0,
      bus: "d-can",
      safetyConfig: { level: "clear_faults", codingConfirmed: false },
    });
    await transport.connect();
    const client = new BmwClient(transport);
    const dme = findEcu("DME")!;
    const ok = await client.clearFaults(dme);
    expect(ok).toBe(true);
    const faults = await client.readFaults(dme);
    expect(faults.length).toBe(0);
    await transport.disconnect();
  });
});
