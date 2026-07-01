/**
 * WebUSB fallback for Android when Web Serial is unavailable.
 * Works with CDC/ACM USB-serial adapters that expose bulk endpoints.
 */

import { DEFAULT_COMMAND_DELAY_MS } from "../capabilities";
import { assertCommandAllowed, type SafetyGateConfig } from "../safety";
import type { ObdTransport, TransportOptions } from "./types";

declare global {
  interface Navigator {
    usb?: USB;
  }
  interface USB {
    requestDevice(options: USBDeviceRequestOptions): Promise<USBDevice>;
  }
  interface USBDeviceRequestOptions {
    filters: USBDeviceFilter[];
  }
  interface USBDeviceFilter {
    vendorId?: number;
    productId?: number;
    classCode?: number;
  }
  interface USBDevice {
    opened: boolean;
    configuration: USBConfiguration | null;
    open(): Promise<void>;
    close(): Promise<void>;
    selectConfiguration(configurationValue: number): Promise<void>;
    claimInterface(interfaceNumber: number): Promise<void>;
    transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>;
    transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult>;
  }
  interface USBConfiguration {
    interfaces: USBInterface[];
  }
  interface USBInterface {
    interfaceNumber: number;
    alternates: USBAlternateInterface[];
  }
  interface USBAlternateInterface {
    interfaceClass: number;
    endpoints: USBEndpoint[];
  }
  interface USBEndpoint {
    endpointNumber: number;
    direction: "in" | "out";
    type: "bulk" | "interrupt" | "isochronous" | "control";
  }
  interface USBOutTransferResult {
    status: string;
    bytesWritten: number;
  }
  interface USBInTransferResult {
    status: string;
    data?: DataView;
  }
}

const CDC_CLASS = 0x0a;

export class WebUsbTransport implements ObdTransport {
  kind = "webusb" as const;
  private device: USBDevice | null = null;
  private inEndpoint = 0x81;
  private outEndpoint = 0x02;
  private connected = false;
  private readonly commandDelayMs: number;
  private readonly onLog?: (msg: string) => void;
  private safetyConfig: SafetyGateConfig;

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
    if (!navigator.usb) {
      throw new Error("WebUSB not available.");
    }
    this.device = await navigator.usb.requestDevice({
      filters: [
        { classCode: CDC_CLASS },
        { vendorId: 0x0403 },
        { vendorId: 0x1a86 },
        { vendorId: 0x10c4 },
      ],
    });
    await this.device.open();
    if (this.device.configuration === null) {
      await this.device.selectConfiguration(1);
    }
    const iface = this.device.configuration!.interfaces.find((i) =>
      i.alternates.some((a) => a.interfaceClass === 2 || a.interfaceClass === CDC_CLASS),
    );
    if (!iface) throw new Error("No CDC serial interface found on USB device.");
    await this.device.claimInterface(iface.interfaceNumber);
    const alt = iface.alternates[0];
    const outEp = alt.endpoints.find((e) => e.direction === "out" && e.type === "bulk");
    const inEp = alt.endpoints.find((e) => e.direction === "in" && e.type === "bulk");
    if (!outEp || !inEp) throw new Error("Bulk endpoints not found.");
    this.outEndpoint = outEp.endpointNumber;
    this.inEndpoint = inEp.endpointNumber;
    this.connected = true;
    this.onLog?.("Connected via WebUSB");
  }

  async disconnect(): Promise<void> {
    if (this.device?.opened) await this.device.close();
    this.device = null;
    this.connected = false;
  }

  async send(command: string): Promise<string> {
    assertCommandAllowed(command, this.safetyConfig);
    if (!this.device) throw new Error("Not connected");
    const data = new TextEncoder().encode(command.trim() + "\r");
    await this.device.transferOut(this.outEndpoint, data);
    this.onLog?.(`> ${command.trim()}`);
    await new Promise((r) => setTimeout(r, this.commandDelayMs));
    let response = "";
    const deadline = Date.now() + 3000;
    while (Date.now() < deadline) {
      const result = await this.device.transferIn(this.inEndpoint, 256);
      if (result.data) {
        response += new TextDecoder().decode(result.data);
        if (response.includes(">")) break;
      } else {
        await new Promise((r) => setTimeout(r, 50));
      }
    }
    this.onLog?.(`< ${response.replace(/\r/g, " ").trim()}`);
    return response;
  }
}

export function isWebUsbAvailable(): boolean {
  return typeof navigator !== "undefined" && "usb" in navigator;
}
