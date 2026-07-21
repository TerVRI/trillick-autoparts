import { assertServiceAllowed, type BmwSafetyConfig, DEFAULT_BMW_SAFETY } from "../safety";
import { buildKwpFrame, extractKwpFrame, TESTER_ADDRESS } from "../kwp2000";
import { classifyIsoTp, decodeIsoTp, encodeIsoTp } from "../isotp";
import type { BmwBus } from "../types";
import type { BmwTransport, BmwTransportOptions } from "./types";

/**
 * K+DCAN cable transport over Web Serial (desktop Chrome/Edge).
 *
 * The K+DCAN cable is an FTDI USB-serial device, so it enumerates as a serial
 * port. On K-Line, we frame requests as KWP2000 (ISO 14230). On D-CAN, the
 * cable carries raw CAN frames which we wrap as ISO-TP.
 *
 * NOTE: exact BMW/Ediabas byte framing and init timing vary by platform and
 * require on-car validation. This provides the documented protocol structure
 * and a clean transport surface; verify against your vehicle before relying on
 * results, and keep coding/writes disabled (see safety gate).
 */
export class KdcanWebSerialTransport implements BmwTransport {
  kind = "kdcan-web-serial" as const;
  bus: BmwBus;
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private connected = false;
  private buffer: number[] = [];
  private readonly delay: number;
  private readonly onLog?: (m: string) => void;
  private safety: BmwSafetyConfig;

  constructor(options: BmwTransportOptions & { safetyConfig?: BmwSafetyConfig } = {}) {
    this.bus = options.bus ?? "d-can";
    this.delay = options.commandDelayMs ?? 60;
    this.onLog = options.onLog;
    this.safety = options.safetyConfig ?? DEFAULT_BMW_SAFETY;
  }

  setSafetyConfig(config: BmwSafetyConfig) {
    this.safety = config;
  }

  isConnected() {
    return this.connected;
  }

  async connect(): Promise<void> {
    if (typeof navigator === "undefined" || !navigator.serial) {
      throw new Error("Web Serial not available. Use desktop Chrome or Edge.");
    }
    // FTDI vendor id filter (K+DCAN cables are FTDI FT232)
    this.port = await navigator.serial.requestPort({ filters: [{ usbVendorId: 0x0403 }] });
    // D-CAN commonly runs faster; K-Line typically 9600–10400 baud on the wire,
    // but the FTDI link to the PC is a separate higher rate.
    await this.port.open({ baudRate: this.bus === "d-can" ? 115200 : 9600, dataBits: 8, stopBits: 1, parity: "none", flowControl: "none" });
    this.reader = this.port.readable!.getReader();
    this.writer = this.port.writable!.getWriter();
    this.connected = true;
    this.onLog?.(`K+DCAN connected (${this.bus}). Set the cable switch to ${this.bus === "k-line" ? "K-Line (pins 7+8 bridged)" : "D-CAN (pins 7+8 separate)"}.`);
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
      this.buffer = [];
    }
  }

  async request(ecuAddress: number, servicePayload: number[]): Promise<number[]> {
    const sid = servicePayload[0];
    assertServiceAllowed(sid, this.safety);
    if (!this.writer || !this.reader) throw new Error("Not connected");

    const bytes = this.bus === "k-line"
      ? buildKwpFrame(ecuAddress, servicePayload, TESTER_ADDRESS)
      : this.buildDcanFrames(servicePayload);

    await this.writer.write(new Uint8Array(bytes));
    this.onLog?.(`> ${toHex(bytes)}`);
    await sleep(this.delay);

    const raw = await this.readResponse(1500);
    this.buffer.push(...raw);

    if (this.bus === "k-line") {
      const { frame, rest } = extractKwpFrame(this.buffer);
      this.buffer = rest;
      if (frame?.valid) {
        this.onLog?.(`< ${toHex(frame.data)}`);
        return frame.data;
      }
      return [];
    }

    // D-CAN: reassemble ISO-TP frames (8-byte grouping)
    const frames = chunk(this.buffer, 8).filter((f) => f.length === 8);
    const payload = decodeIsoTp(frames);
    this.buffer = [];
    if (payload) {
      this.onLog?.(`< ${toHex(payload)}`);
      return payload;
    }
    // If it was a single frame partially read
    if (frames.length > 0 && classifyIsoTp(frames[0]).type === "single") {
      return classifyIsoTp(frames[0]).data;
    }
    return [];
  }

  private buildDcanFrames(payload: number[]): number[] {
    // Flatten ISO-TP frames into a single byte stream for the cable
    return encodeIsoTp(payload).flat();
  }

  private async readResponse(timeoutMs: number): Promise<number[]> {
    const out: number[] = [];
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const result = await Promise.race([
        this.reader!.read(),
        sleep(120).then(() => ({ value: undefined, done: true as const })),
      ]);
      if (result.value && result.value.length) {
        out.push(...Array.from(result.value));
        if (out.length >= 3) break;
      }
    }
    return out;
  }
}

function chunk(arr: number[], size: number): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function toHex(bytes: number[]) {
  return bytes.map((b) => b.toString(16).toUpperCase().padStart(2, "0")).join(" ");
}
