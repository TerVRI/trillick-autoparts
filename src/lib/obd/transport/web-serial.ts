import { DEFAULT_COMMAND_DELAY_MS } from "../capabilities";
import { assertCommandAllowed, type SafetyGateConfig } from "../safety";
import type { ObdTransport, TransportOptions } from "./types";

declare global {
  interface Navigator {
    serial?: Serial;
  }
  interface Serial {
    requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
    getPorts(): Promise<SerialPort[]>;
  }
  interface SerialPortRequestOptions {
    filters?: SerialPortFilter[];
  }
  interface SerialPortFilter {
    usbVendorId?: number;
    usbProductId?: number;
  }
  interface SerialPort {
    open(options: SerialOptions): Promise<void>;
    close(): Promise<void>;
    readable: ReadableStream<Uint8Array> | null;
    writable: WritableStream<Uint8Array> | null;
  }
  interface SerialOptions {
    baudRate: number;
    dataBits?: number;
    stopBits?: number;
    parity?: "none" | "even" | "odd";
    flowControl?: "none" | "hardware";
  }
}

/** Common ELM327 USB vendor IDs for port filtering */
export const ELM327_USB_FILTERS: SerialPortFilter[] = [
  { usbVendorId: 0x0403 }, // FTDI
  { usbVendorId: 0x1a86 }, // CH340
  { usbVendorId: 0x10c4 }, // Silicon Labs CP210x
  { usbVendorId: 0x067b }, // Prolific
];

export class WebSerialTransport implements ObdTransport {
  kind = "web-serial" as const;
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private connected = false;
  private buffer = "";
  private readonly baudRate: number;
  private readonly commandDelayMs: number;
  private readonly onLog?: (msg: string) => void;
  private safetyConfig: SafetyGateConfig;

  constructor(options: TransportOptions & { safetyConfig?: SafetyGateConfig } = {}) {
    this.baudRate = options.baudRate ?? 38400;
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
    if (!navigator.serial) {
      throw new Error("Web Serial API not available. Use Chrome or Edge.");
    }
    this.port = await navigator.serial.requestPort({ filters: ELM327_USB_FILTERS });
    await this.port.open({ baudRate: this.baudRate, dataBits: 8, stopBits: 1, parity: "none", flowControl: "none" });
    this.reader = this.port.readable!.getReader();
    this.writer = this.port.writable!.getWriter();
    this.connected = true;
    this.onLog?.(`Connected at ${this.baudRate} baud`);
    await this.drain(200);
  }

  async disconnect(): Promise<void> {
    try {
      await this.reader?.cancel();
      this.reader?.releaseLock();
      await this.writer?.close();
      this.writer?.releaseLock();
      await this.port?.close();
    } finally {
      this.reader = null;
      this.writer = null;
      this.port = null;
      this.connected = false;
      this.buffer = "";
    }
  }

  async send(command: string): Promise<string> {
    assertCommandAllowed(command, this.safetyConfig);
    if (!this.writer || !this.reader) {
      throw new Error("Not connected");
    }
    const payload = new TextEncoder().encode(command.trim() + "\r");
    await this.writer.write(payload);
    this.onLog?.(`> ${command.trim()}`);
    await sleep(this.commandDelayMs);
    const response = await this.readUntilPrompt(3000);
    this.onLog?.(`< ${response.replace(/\r/g, " ").trim()}`);
    return response;
  }

  private async readUntilPrompt(timeoutMs: number): Promise<string> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const chunk = await this.readChunk(100);
      if (chunk) {
        this.buffer += chunk;
        if (this.buffer.includes(">") || this.buffer.includes("\r\r")) {
          const out = this.buffer;
          this.buffer = "";
          return out;
        }
      }
    }
    const out = this.buffer;
    this.buffer = "";
    return out;
  }

  private async readChunk(ms: number): Promise<string> {
    if (!this.reader) return "";
    const result = await Promise.race([
      this.reader.read(),
      sleep(ms).then(() => ({ value: undefined, done: true as const })),
    ]);
    if (result.value) {
      return new TextDecoder().decode(result.value);
    }
    return "";
  }

  private async drain(ms: number) {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      await this.readChunk(50);
    }
    this.buffer = "";
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
