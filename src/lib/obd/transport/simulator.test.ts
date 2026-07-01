import { describe, expect, it } from "vitest";
import { SimulatorTransport } from "./simulator";
import { Elm327Client } from "../elm327";
import { DEFAULT_SAFETY_CONFIG } from "../safety";

describe("simulator transport", () => {
  it("connects and returns ELM327 identity", async () => {
    const transport = new SimulatorTransport({ commandDelayMs: 0 });
    await transport.connect();
    expect(transport.isConnected()).toBe(true);
    const response = await transport.send("ATI");
    expect(response).toMatch(/ELM327/i);
    await transport.disconnect();
    expect(transport.isConnected()).toBe(false);
  });

  it("returns simulated PID data", async () => {
    const transport = new SimulatorTransport({ commandDelayMs: 0 });
    await transport.connect();
    const client = new Elm327Client(transport);
    await client.initialize();
    const rpm = await client.readPid("0C");
    expect(rpm.supported).toBe(true);
    expect(rpm.value).toBeGreaterThan(0);
    await transport.disconnect();
  });

  it("returns sample stored and pending DTCs", async () => {
    const transport = new SimulatorTransport({ commandDelayMs: 0 });
    await transport.connect();
    const client = new Elm327Client(transport);
    const stored = await client.readStoredDtcs();
    const pending = await client.readPendingDtcs();
    expect(stored.some((d) => d.code === "P0420")).toBe(true);
    expect(pending.some((d) => d.code === "P0101")).toBe(true);
    await transport.disconnect();
  });

  it("blocks clear DTC in read-only safety mode", async () => {
    const transport = new SimulatorTransport({
      commandDelayMs: 0,
      safetyConfig: DEFAULT_SAFETY_CONFIG,
    });
    await transport.connect();
    await expect(transport.send("04")).rejects.toThrow(/blocked|read-only/i);
    await transport.disconnect();
  });

  it("allows clear DTC in diagnostics mode", async () => {
    const transport = new SimulatorTransport({
      commandDelayMs: 0,
      safetyConfig: { level: "diagnostics", labModeConfirmed: false, labCommandWhitelist: [] },
    });
    await transport.connect();
    const before = await transport.send("03");
    expect(before).toMatch(/43/);
    await transport.send("04");
    const after = await transport.send("03");
    expect(after).toMatch(/43 00|43 0/);
    await transport.disconnect();
  });
});
