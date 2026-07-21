import { parseDtcPayload } from "./dtc";
import { ecusForBus } from "./ecus";
import {
  kwpReadEcuIdentification,
  parseUdsResponse,
  readDataByIdentifier,
  readDtcByStatusMask,
  UDS_SERVICE,
} from "./uds";
import type {
  BmwBus,
  EcuDefinition,
  EcuIdentification,
  EcuScanResult,
} from "./types";
import type { BmwTransport } from "./transport/types";

/** High-level INPA-style read operations built on a transport. */
export class BmwClient {
  constructor(
    private transport: BmwTransport,
    private onLog?: (m: string) => void,
  ) {}

  get bus(): BmwBus {
    return this.transport.bus;
  }

  async readIdentification(ecu: EcuDefinition): Promise<EcuIdentification | null> {
    const request = this.bus === "k-line"
      ? kwpReadEcuIdentification(0x80)
      : readDataByIdentifier(0xf190); // VIN DID
    const raw = await this.transport.request(ecu.address, request);
    const parsed = parseUdsResponse(raw);
    if (!parsed || !parsed.positive) return null;
    const text = parsed.data
      .filter((b) => b >= 32 && b <= 126)
      .map((b) => String.fromCharCode(b))
      .join("");
    const vinMatch = text.match(/[A-HJ-NPR-Z0-9]{17}/i);
    return {
      ecuCode: ecu.code,
      address: ecu.address,
      vin: vinMatch ? vinMatch[0].toUpperCase() : undefined,
      rawIdentification: text || undefined,
    };
  }

  async readFaults(ecu: EcuDefinition) {
    const request = this.bus === "k-line"
      ? [UDS_SERVICE.KWP_READ_DTC_BY_STATUS, 0x00, 0xff, 0x00]
      : readDtcByStatusMask(0xff);
    const raw = await this.transport.request(ecu.address, request);
    const parsed = parseUdsResponse(raw);
    if (!parsed || !parsed.positive) return [];
    return parseDtcPayload(parsed.data);
  }

  /** Clear fault memory — gated by the safety layer inside the transport. */
  async clearFaults(ecu: EcuDefinition): Promise<boolean> {
    const raw = await this.transport.request(ecu.address, [UDS_SERVICE.CLEAR_DIAGNOSTIC_INFO, 0xff, 0xff]);
    const parsed = parseUdsResponse(raw);
    return !!parsed?.positive;
  }

  /** Scan all catalog ECUs for the active bus. */
  async scanAll(): Promise<EcuScanResult[]> {
    const results: EcuScanResult[] = [];
    for (const ecu of ecusForBus(this.bus)) {
      try {
        const identification = await this.readIdentification(ecu);
        const faults = await this.readFaults(ecu);
        results.push({
          ecu,
          reachable: identification !== null,
          identification: identification ?? undefined,
          faultCount: faults.length,
        });
        this.onLog?.(`Scanned ${ecu.code}: ${identification ? "reachable" : "no response"}, ${faults.length} fault(s)`);
      } catch (e) {
        results.push({
          ecu,
          reachable: false,
          error: e instanceof Error ? e.message : "error",
        });
      }
    }
    return results;
  }
}
