import { assertServiceAllowed, type BmwSafetyConfig, DEFAULT_BMW_SAFETY } from "../safety";
import { POSITIVE_RESPONSE_OFFSET, UDS_SERVICE } from "../uds";
import type { BmwBus } from "../types";
import type { BmwTransport, BmwTransportOptions } from "./types";

/**
 * Simulated BMW ECU responses for development without a car or K+DCAN cable.
 * Returns plausible identification and fault data for a couple of modules.
 */
export class BmwSimulatorTransport implements BmwTransport {
  kind = "simulator" as const;
  bus: BmwBus;
  private connected = false;
  private readonly delay: number;
  private readonly onLog?: (m: string) => void;
  private safety: BmwSafetyConfig;
  private clearedEcus = new Set<number>();

  constructor(options: BmwTransportOptions & { safetyConfig?: BmwSafetyConfig } = {}) {
    this.bus = options.bus ?? "d-can";
    this.delay = options.commandDelayMs ?? 40;
    this.onLog = options.onLog;
    this.safety = options.safetyConfig ?? DEFAULT_BMW_SAFETY;
  }

  setSafetyConfig(config: BmwSafetyConfig) {
    this.safety = config;
  }

  isConnected() {
    return this.connected;
  }

  async connect() {
    this.connected = true;
    this.onLog?.(`Simulator connected (${this.bus})`);
  }

  async disconnect() {
    this.connected = false;
  }

  async request(ecuAddress: number, payload: number[]): Promise<number[]> {
    const sid = payload[0];
    assertServiceAllowed(sid, this.safety);
    await sleep(this.delay);
    this.onLog?.(`> ECU 0x${ecuAddress.toString(16)}: ${toHex(payload)}`);

    const respond = (bytes: number[]) => {
      this.onLog?.(`< ${toHex(bytes)}`);
      return bytes;
    };

    // Tester present / session control
    if (sid === UDS_SERVICE.TESTER_PRESENT) return respond([sid + POSITIVE_RESPONSE_OFFSET, 0x00]);
    if (sid === UDS_SERVICE.DIAGNOSTIC_SESSION_CONTROL) return respond([sid + POSITIVE_RESPONSE_OFFSET, payload[1] ?? 0x01]);

    // Read ECU identification (KWP 0x1A or UDS 0x22)
    if (sid === UDS_SERVICE.KWP_READ_ECU_ID || sid === UDS_SERVICE.READ_DATA_BY_ID) {
      const vin = "WBA" + "PL9C50" + `${(ecuAddress % 90) + 10}` + "234567";
      const idBytes = [...vin.slice(0, 17)].map((c) => c.charCodeAt(0));
      return respond([sid + POSITIVE_RESPONSE_OFFSET, ...idBytes]);
    }

    // Read DTCs (UDS 0x19 / KWP 0x18)
    if (sid === UDS_SERVICE.READ_DTC_INFORMATION || sid === UDS_SERVICE.KWP_READ_DTC_BY_STATUS) {
      if (this.clearedEcus.has(ecuAddress)) {
        return respond([sid + POSITIVE_RESPONSE_OFFSET, 0xff]);
      }
      // status availability mask + 4-byte records [hi][mid][lo][status]
      const records = ecuAddress === 0x12
        ? [0x03, 0x01, 0x00, 0x2f, 0x04, 0x20, 0x00, 0x28]
        : [0x29, 0x0a, 0x00, 0x2f];
      return respond([sid + POSITIVE_RESPONSE_OFFSET, 0xff, ...records]);
    }

    // Clear diagnostic info (gated)
    if (sid === UDS_SERVICE.CLEAR_DIAGNOSTIC_INFO) {
      this.clearedEcus.add(ecuAddress);
      return respond([sid + POSITIVE_RESPONSE_OFFSET]);
    }

    // Negative response: service not supported
    return respond([0x7f, sid, 0x11]);
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function toHex(bytes: number[]) {
  return bytes.map((b) => b.toString(16).toUpperCase().padStart(2, "0")).join(" ");
}
