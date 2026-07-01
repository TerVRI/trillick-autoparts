import { DEFAULT_COMMAND_DELAY_MS } from "../capabilities";
import { assertCommandAllowed, type SafetyGateConfig } from "../safety";
import type { ObdTransport, TransportOptions } from "./types";

/** Simulated Land Rover-ish idle/drive cycle for demo without hardware */
export class SimulatorTransport implements ObdTransport {
  kind = "simulator" as const;
  private connected = false;
  private tick = 0;
  private readonly commandDelayMs: number;
  private readonly onLog?: (msg: string) => void;
  private safetyConfig: SafetyGateConfig;
  private storedDtcs = ["P0420", "P0171"];
  private pendingDtcs = ["P0101"];

  constructor(options: TransportOptions & { safetyConfig?: SafetyGateConfig } = {}) {
    this.commandDelayMs = options.commandDelayMs ?? DEFAULT_COMMAND_DELAY_MS;
    this.onLog = options.onLog;
    this.safetyConfig = options.safetyConfig ?? { level: "read_only", labModeConfirmed: false, labCommandWhitelist: [] };
  }

  setSafetyConfig(config: SafetyGateConfig) {
    this.safetyConfig = config;
  }

  isConnected() {
    return this.connected;
  }

  async connect(): Promise<void> {
    this.connected = true;
    this.tick = 0;
    this.onLog?.("Simulator connected — demo data active");
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async send(command: string): Promise<string> {
    assertCommandAllowed(command, this.safetyConfig);
    await sleep(this.commandDelayMs);
    const cmd = command.trim().toUpperCase();
    this.onLog?.(`> ${cmd}`);

    let response: string;
    if (cmd === "ATZ") response = "ELM327 v1.5\r\r>";
    else if (cmd === "ATI") response = "ELM327 v1.5\r\r>";
    else if (cmd === "ATDP") response = "AUTO, ISO 15765-4 CAN (11/500)\r\r>";
    else if (cmd.startsWith("ATSP")) response = "OK\r\r>";
    else if (cmd === "ATE0" || cmd === "ATL0" || cmd === "ATH1" || cmd === "ATS0") response = "OK\r\r>";
    else if (cmd === "0100") response = "41 00 BE 1F A8 13\r\r>";
    else if (cmd === "03") response = this.formatDtcResponse("43", this.storedDtcs);
    else if (cmd === "07") response = this.formatDtcResponse("47", this.pendingDtcs);
    else if (cmd === "04") {
      if (this.safetyConfig.level === "diagnostics" || (this.safetyConfig.level === "lab_mode" && this.safetyConfig.labModeConfirmed)) {
        this.storedDtcs = [];
        response = "44\r\r>";
      } else {
        throw new Error("Clear DTC blocked in read-only mode.");
      }
    } else if (cmd === "0101") response = "41 01 81 07 65 04\r\r>";
    else if (cmd.startsWith("09")) response = "49 02 01 53 41 4C 47 42 4B 32 46 45 31 4D 45 30 31 32 33 34 35\r\r>";
    else if (cmd.startsWith("01")) {
      const pid = cmd.slice(2);
      response = this.simulatePid(pid);
    } else response = "NO DATA\r\r>";

    this.onLog?.(`< ${response.replace(/\r/g, " ").trim()}`);
    return response;
  }

  private simulatePid(pid: string): string {
    this.tick += 1;
    const t = this.tick / 10;
    const rpm = Math.round(750 + Math.sin(t) * 200 + (Math.random() - 0.5) * 30);
    const speed = Math.max(0, Math.round(Math.sin(t * 0.3) * 40 + 20));
    const coolant = Math.round(88 + Math.sin(t * 0.1) * 2);
    const values: Record<string, string> = {
      "0C": `41 0C ${hexByte((rpm * 4) >> 8)} ${hexByte((rpm * 4) & 0xff)}`,
      "0D": `41 0D ${hexByte(speed)}`,
      "05": `41 05 ${hexByte(coolant + 40)}`,
      "0F": `41 0F ${hexByte(25 + 40)}`,
      "11": `41 11 ${hexByte(Math.round(18 + Math.sin(t) * 5))}`,
      "04": `41 04 ${hexByte(Math.round(22 + speed / 5))}`,
      "06": `41 06 ${hexByte(128 + Math.round(Math.sin(t) * 3))}`,
      "10": `41 10 ${hexByte(2)} ${hexByte(180)}`,
      "0B": `41 0B ${hexByte(95)}`,
      "42": `41 42 ${hexByte(13)} ${hexByte(80)}`,
    };
    return (values[pid.toUpperCase()] ?? "NO DATA") + "\r\r>";
  }

  private formatDtcResponse(prefix: string, codes: string[]): string {
    if (codes.length === 0) return `${prefix} 00\r\r>`;
    const bytes: number[] = [];
    for (const code of codes) {
      const parsed = encodeDtc(code);
      if (parsed) bytes.push(...parsed);
    }
    const hex = bytes.map((b) => hexByte(b)).join(" ");
    return `${prefix} ${String(bytes.length).padStart(2, "0")} ${hex}\r\r>`;
  }
}

function hexByte(n: number) {
  return n.toString(16).toUpperCase().padStart(2, "0");
}

function encodeDtc(code: string): [number, number] | null {
  const c = code.toUpperCase();
  const typeMap: Record<string, number> = { P: 0, C: 1, B: 2, U: 3 };
  const t = typeMap[c[0]];
  if (t === undefined) return null;
  const d1 = parseInt(c[1], 10);
  const d2 = parseInt(c[2], 16);
  const d3 = parseInt(c[3], 16);
  const d4 = parseInt(c[4], 16);
  const a = (t << 6) | (d1 << 4) | d2;
  const b = (d3 << 4) | d4;
  return [a, b];
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
