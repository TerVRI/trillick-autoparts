import { parseDtcResponse, parseReadiness, parseVinResponse } from "./dtc-parser";
import { decodePid, parseObdResponse } from "./pids";
import type { AdapterInfo, DiagnosticSnapshot, LivePidValue } from "./types";
import type { ObdTransport } from "./transport/types";

/** High-level ELM327 client built on any transport */
export class Elm327Client {
  constructor(
    private transport: ObdTransport,
    private onLog?: (msg: string) => void,
  ) {}

  async initialize(): Promise<AdapterInfo> {
    await this.transport.send("ATZ");
    await this.transport.send("ATE0");
    await this.transport.send("ATL0");
    await this.transport.send("ATH1");
    await this.transport.send("ATSP0");
    const info = await this.transport.send("ATI");
    const protocol = (await this.transport.send("ATDP")).replace(/>/g, "").trim();
    return {
      kind: this.transport.kind,
      label: info.replace(/\r/g, " ").replace(/>/g, "").trim() || "ELM327",
      firmware: info.replace(/\r/g, " ").trim(),
      protocol,
    };
  }

  async readPid(pid: string): Promise<LivePidValue> {
    const raw = await this.transport.send(`01${pid}`);
    const bytes = parseObdResponse(raw, pid);
    return decodePid(pid, bytes);
  }

  async readStoredDtcs() {
    const raw = await this.transport.send("03");
    return parseDtcResponse(raw, "stored");
  }

  async readPendingDtcs() {
    const raw = await this.transport.send("07");
    return parseDtcResponse(raw, "pending");
  }

  async readReadiness() {
    const raw = await this.transport.send("0101");
    return parseReadiness(raw);
  }

  async readVin(): Promise<string | null> {
    const raw = await this.transport.send("0902");
    return parseVinResponse(raw);
  }

  async readDiagnostics(): Promise<DiagnosticSnapshot> {
    const [vin, stored, pending, readiness] = await Promise.all([
      this.readVin().catch(() => null),
      this.readStoredDtcs().catch(() => []),
      this.readPendingDtcs().catch(() => []),
      this.readReadiness().catch(() => []),
    ]);
    return {
      vin,
      dtcs: [...stored, ...pending],
      readiness,
      adapter: null,
    };
  }
}
